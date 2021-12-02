import path from 'path';
import { promises as fs } from 'fs';
const sharp = require('sharp');

export default async function sharpImage(imagePath, destPath, destName, options) {
    try {
        const fileName = imagePath.split(path.sep).pop();
        const extention = fileName.split('.').pop();

        // bugfix:windows系统中，使用sharp对名称为中文的文件进行压缩时，sharp()返回报文会缺少size属性
        // 因此使用encode进行转译，压缩成功后再重命名
        const tempDestName = encodeURIComponent(destName);
        const fullDestPath = path.join(destPath, tempDestName);
        const finalDestPath = path.join(destPath, destName);

        let sharpRsp = null;
        if (extention === 'png') {
            const quality = options.quality || 60;
            const compressionLevel = options.compressionLevel || 6;

            sharpRsp = await sharp(imagePath)
                .png({ palette: true, quality, compressionLevel })
                .toFile(fullDestPath);
        }
        if (extention === 'jpg' || extention === 'jpeg') {
            const quality = options.quality || 60;

            sharpRsp = await sharp(imagePath)
                .jpeg({ quality: options.quality })
                .toFile(fullDestPath);
        }
        if (extention === 'gif') {
            sharpRsp = await sharp(imagePath)
                .gif({ loop: options.loop })
                .toFile(fullDestPath);
        }

        await fs.rename(fullDestPath, finalDestPath);
        return sharpRsp;
    } catch (err) {
        return err;
    }
}
