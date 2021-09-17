const sharp = require('sharp');

export default async function sharpImage(imagePath, destPath) {
    try {
        const fileName = imagePath.split('/').pop();
        const extention = fileName.split('.').pop();

        let sharpRsp = null;
        if (extention === 'png') {
            sharpRsp = await sharp(imagePath)
                .png({ palette: true, quality: 60 })
                .toFile(destPath);
        }
        if (extention === 'jpg' || extention === 'jpeg') {
            sharpRsp = await sharp(imagePath)
                .jpeg()
                .toFile(destPath);
        }
        return sharpRsp;
    } catch (err) {
        return err;
    }
}
