/* eslint-disable max-len */
import { promises as fs } from 'fs';
import path from 'path';
import express from 'express';
import multer from 'multer';

import sharpImage from './compress/sharp';
import zipFiles from './compress/archiver';
import { getPathFromRoot, getReqIp, checkDir, deleteSomeSubdir } from './utils';

const PORT = process.argv.pop().split('=')[1] || 8080;
const uploadTargetPath = getPathFromRoot('uploads');
const minifyTargetPath = getPathFromRoot('minified');
const zipsPath = getPathFromRoot('zips');
const zipName = 'archived';
const app = express();

// 配置图片的上传目录
const storage = multer.diskStorage({
    destination: async function(req, file, cb) {
        // 确保uploads/IP目录已存在
        await checkDir(uploadTargetPath);
        // 使用path.normalize解决windows系统文件路径的反斜杠问题
        const ipDir = path.normalize(`${uploadTargetPath}/${getReqIp(req)}`);
        await checkDir(path.normalize(`${uploadTargetPath}/${getReqIp(req)}`));
        cb(null, ipDir);
    },
});
const upload = multer({ storage });

app.use(express.static(getPathFromRoot('dist')));

// GET 首页
// 首页加载时会在指定的static目录下寻找index文件，无需仔配置app.get('/')

// 上传并压缩保存图片
app.post('/minify', upload.single('file'), async (req, rsp) => {
    // 对uploads中上传成功的图片重命名，和上传前保持一致
    const userIp = getReqIp(req);
    const { file } = req;
    const { originalname, path: uploadedFilePath, destination } = file;
    const renamePath = path.join(destination, originalname);
    await fs.rename(uploadedFilePath, renamePath);

    // 检查是否存在minified/IP目录，没有则需要创建
    await checkDir(minifyTargetPath);
    const miniIpPath = path.normalize(`${minifyTargetPath}/${userIp}`);
    await checkDir(miniIpPath);

    // 以uploads/IP为源目录进行压缩，并保存压缩后的图片至minified/IP目录下
    const sharpResult = await sharpImage(renamePath, miniIpPath, originalname);
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
    const userIp = getReqIp(req);
    // 删除uploads/IP目录、minified/IP目录、zips/IP目录
    const delUploadMsg = await deleteSomeSubdir(uploadTargetPath, userIp);
    const delMiniMsg = await deleteSomeSubdir(minifyTargetPath, userIp);
    const delZipsMsg = await deleteSomeSubdir(zipsPath, userIp);

    rsp.json({ code: 'OK', delUploadMsg, delMiniMsg, delZipsMsg });
});

app.listen(PORT, async () => {
    // await open(`http://localhost:${PORT}`);
    console.log(`serevr listening on port:${PORT}......`);
});
