import moment from "moment";

type TimeType = "MM-DD HH:mm" | "YYYY/MM/DD HH:mm";

export function timeFormat(time: number, type: TimeType) {
    if (type === "MM-DD HH:mm") return moment.unix(time).format(type);
    if (type === "YYYY/MM/DD HH:mm") return moment(time).format(type);
}
