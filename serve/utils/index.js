import path from 'path';
import { promises as fs } from 'fs';
import Log from './log';

export const sayHello = () => 'hello world';
export const getPathFromRoot = (dir) => path.join(process.cwd(), dir);
export const formatDirStr = (str) => str.replace(`${process.cwd()}/`, '');
export const getDate = () => {
    const nowDate = new Date();
    const nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowDay = nowDate.getDate();
    let nowHour = nowDate.getHours();
    let nowMinutes = nowDate.getMinutes();

    nowMonth = nowMonth < 10 ? `0${nowMonth}` : nowMonth;
    nowDay = nowDay < 10 ? `0${nowDay}` : nowDay;
    nowHour = nowHour < 10 ? `0${nowHour}` : nowHour;
    nowMinutes = nowMinutes < 10 ? `0${nowMinutes}` : nowMinutes;

    return `${nowYear}${nowMonth}${nowDay}${nowHour}${nowMinutes}`;
};
export const getReqIp = (request) => {
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    // 使用ip创建目录时，windows平台不允许"."符号存在于名称中
    // 因此将"1.2.3.4"格式转化为"1234"
    return ip.match(/\d/g).join('');
};

// TODO: 待优化
// 并发请求可能导致多个请求在未创建IP目录时，同时被catch
// 第一个请求创建目录后，后续请求再次创建就会导致报错无法继续执行
// 因此需要再次catch，并按照重复创建目录的报错进行处理
export const checkDir = async (dir) => {
    try {
        await fs.access(dir);
        return { exist: true };
    } catch (error) {
        const message = `${error.path} no exists!`;
        Log.error(`【Function】checkDir: ${message}`);

        try {
            await fs.mkdir(dir);
            return {};
        } catch (err) {
            const message = `${err.path} already existed!`;
            Log.error(`【Function】checkDir: ${message}`);
        }
    }
};

export const deleteSubdirs = async (dir) => {
    let message = '';
    try {
        await fs.access(dir);
        const readRsp = await fs.readdir(dir);
        const rmPromises = readRsp.map((fileOrDir) => fs.rmdir(`${dir}/${fileOrDir}`, { recursive: true }));
        await Promise.all(rmPromises);
        message = `Delete "${dir}" sub-dirs &`;
    } catch (error) {
        message = `${error.path} no exists!`;
        Log.error(`【Function】deleteDir: ${message}`);
    }
    return formatDirStr(message);
};

export const deleteDir = async (dir) => {
    let message = '';
    try {
        await fs.access(dir);
        await fs.rmdir(dir, { recursive: true });
        message = `Delete "${dir}"!`;
    } catch (error) {
        message = `${error.path} no exists!`;
        Log.error(`【Function】deleteDir: ${message}`);
    }
    return formatDirStr(message);
};

// 删除指定父级目录下的某个子目录
export const deleteSomeSubdir = async (parentDir, subDir) => {
    let message = '';
    try {
        await fs.access(parentDir);
        const fullPath = path.normalize(`${parentDir}/${subDir}`);
        await fs.access(fullPath);
        message = await deleteDir(fullPath);
    } catch (error) {
        message = `${error.path} no exists!`;
        Log.warn(`【Function】deleteSomeSubdir: ${message}`);
    }
    return formatDirStr(message);
};
