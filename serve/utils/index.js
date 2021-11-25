import path from 'path';
import fs from 'fs/promises';

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
export const getReqIp = (request) => request.headers['x-forwarded-for'] || request.socket.remoteAddress;

// TODO: 待优化
// 并发请求可能导致多个请求在未创建IP目录时，同时被catch
// 第一个请求创建目录后，后续请求再次创建就会导致报错无法继续执行
// 因此需要再次catch，并按照重复创建目录的报错进行处理
export const checkDir = async (dir) => {
    try {
        await fs.access(dir);
        return { exist: true };
    } catch (error) {
        try {
            await fs.mkdir(dir);
            return {};
        } catch (err) {
            // console.log(error);
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
        console.error(error);
        message = `No "${dir}" dir!`;
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
        console.error(error);
        message = `No "${dir}"!`;
    }
    return formatDirStr(message);
};

export const deleteSomeSubdir = async (parentDir, subDirName) => {
    let message = '';
    try {
        await fs.access(parentDir);
        message = await deleteDir(`${parentDir}/${subDirName}`);
    } catch (error) {
        message = `No ${parentDir}!`;
    }
    return formatDirStr(message);
};
