import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';

/**
 * if compress with imagemin package
 * "imagemin": "^7.0.1",
 * "imagemin-jpegtran": "^7.0.0",
 * "imagemin-pngquant": "^9.0.2",
 * @returns
 */

export const sayMyName = () => 'this is calvin';
export const minifyImages = async function minifyImages(imagePath, destination) {
    try {
        const filesArr = await imagemin([imagePath], {
            destination,
            plugins: [
                imageminJpegtran({
                    progressive: true,
                }),
                imageminPngquant({
                    quality: [0.6, 0.6],
                }),
            ],
        });
        return filesArr;
    } catch (err) {
        console.log(err, '####');
        return err;
    }
};
