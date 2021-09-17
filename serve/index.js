/* eslint-disable max-len */
import fs from 'fs/promises';
import express from 'express';
import multer from 'multer';

import sharpImage from './compress/sharp';
import zipFiles from './compress/archiver';
import { getPathFromRoot, getReqIp } from './utils';

const PORT = process.env.PORT || 8080;
const uploadTargetPath = getPathFromRoot('uploads');
const minifyTargetPath = getPathFromRoot('minified');
const zipsPath = getPathFromRoot('zips');
const zipName = 'archived';
const upload = multer({ dest: uploadTargetPath });
const app = express();

app.use(express.static(getPathFromRoot('dist')));

// GET 首页
// 首页加载时会在指定的static目录下寻找index文件，无需仔配置app.get('/')

// 上传并压缩保存图片
app.post('/minify', upload.single('file'), async (req, rsp) => {
    // 对uploads中上传成功的图片重命名，和上传前保持一致
    const { file } = req;
    const { originalname, path } = file;
    const renamePath = `${uploadTargetPath}/${originalname}`;
    await fs.rename(path, renamePath);

    // 检查是否存在以当前用户IP命名的目录，没有则需要创建
    const userIp = getReqIp(req);
    const miniDir = getPathFromRoot(`minified/${userIp}`);
    try {
        await fs.access(miniDir);
    } catch (error) {
        // TODO: 待优化
        // 并发请求可能导致多个请求在未创建IP目录时，同时被catch
        // 第一个请求创建目录后，后续请求再次创建就会导致报错无法继续执行
        // 因此需要再次catch，并按照重复创建目录的报错进行处理
        try {
            await fs.mkdir(miniDir);
        } catch (err) {
            console.log(originalname, error);
        }
    }

    // 以uploads为源目录进行压缩，并保存压缩后的图片至用户IP目录下
    const destPath = `${miniDir}/${originalname}`;
    const sharpResult = await sharpImage(renamePath, destPath);
    const { size } = sharpResult;
    if (size) {
        // 压缩且保存成功后，删除uploads中对应的源文件，并返回压缩后的尺寸信息
        await fs.unlink(renamePath);
        rsp.json({
            code: 'OK',
            message: 'sharp success',
            info: { minisize: size, path: `/download/${userIp}/${originalname}` },
        });
    } else {
        rsp.json({ code: 'FAIL', message: 'upload failed' });
    }
});

// 打包压缩后的图片为 *.zip
app.post('/archive', (req, rsp) => zipFiles(req, rsp, minifyTargetPath, zipsPath, zipName));

// 下载压缩后的单个图片
app.get('/download/:ip/:file', (req, rsp) => {
    const { ip, file } = req.params;
    rsp.download(`${minifyTargetPath}/${ip}/${file}`);
});

// 下载zip包
app.get('/download/all', (req, rsp) => {
    const userIp = getReqIp(req);
    rsp.download(`${zipsPath}/${userIp}/${zipName}.zip`);
});

// 压缩成功后删除缓存的压缩图片
app.post('/delete/all', async (req, rsp) => {
    try {
        await fs.access(minifyTargetPath);
        const readRsp = await fs.readdir(minifyTargetPath);
        const rmPromises = readRsp.map((fileOrDir) => fs.rmdir(`${minifyTargetPath}/${fileOrDir}`, { recursive: true }));
        await Promise.all(rmPromises);

        try {
            await fs.access(zipsPath);
            await fs.rmdir(zipsPath, { recursive: true });
        } catch (error) {
            console.error(error);
        }
        rsp.json({
            code: 'OK',
            message: 'Delete all cached mini files',
        });
    } catch (err) {
        rsp.json({
            code: 'FAIL',
            message: 'Delete failed',
        });
    }
});

app.listen(PORT, async () => {
    // await open(`http://localhost:${PORT}`);
    console.log(`serevr listening on port:${PORT}......`);
});
