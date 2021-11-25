import fs from 'fs';
import archiver from 'archiver';
import { getReqIp } from '../utils';

// if compress with archiver package
// "archiver": "^5.3.0",

export default function zipFiles(req, rsp, sourceDir, zipsDir, zipName = 'archived') {
    // 创建zip包的保存目录
    const userIp = getReqIp(req);
    const zipDir = `${zipsDir}/${userIp}`;
    try {
        fs.accessSync(zipsDir);
    } catch (err) {
        fs.mkdirSync(zipsDir);
    }
    try {
        fs.accessSync(zipDir);
    } catch (err) {
        fs.mkdirSync(zipDir);
    }

    // 创建文件以写入要压缩的文档流数据
    const output = fs.createWriteStream(`${zipDir}/${zipName}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } }); // 设置压缩等级

    // 监听所有写入压缩文件的文档流
    // 压缩完成之后触发'close'事件
    const closeHandler = () => {
        console.log(`${archive.pointer()} total bytes`);
        console.log('archiver has been finalized and the output file descriptor has closed.');
        // rsp.download(`${zipsPath}/${zipName}.zip`);
        rsp.json({ code: 'OK', message: 'ziped all files', path: '/download/all' });
    };
    output.on('close', closeHandler);

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', () => console.log('Data has been drained'));

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', (err) => {
        rsp.json({ code: 'FAIL', message: 'zip failed' });
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append files from a sub-directory and naming it `new-subdir` within the archive
    archive.directory(`${sourceDir}/${userIp}`, zipName);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // eslint-disable-next-line max-len
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
}
