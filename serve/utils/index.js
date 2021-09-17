import path from 'path';

export const sayHello = () => 'hello world';
export const getPathFromRoot = (dir) => path.join(process.cwd(), dir);
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
