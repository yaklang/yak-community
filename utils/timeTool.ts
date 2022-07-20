import moment from "moment";

type TimeType = "MM-DD HH:mm" | "YYYY/MM/DD HH:mm" | "YYYYMMDDHHmm";

export function timeFormat(time: number, type: TimeType) {
    return moment.unix(time).format(type);
}

export function generateTimeName() {
    const time = new Date().getTime();
    return `${moment(time).format("YYYYMMDDHHmmss")}${time}`;
}
