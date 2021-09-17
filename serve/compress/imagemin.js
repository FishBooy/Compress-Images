import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';

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
