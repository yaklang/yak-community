import axios from "axios";
import { message } from "antd";
import { ApiConfigProps } from "../types/api";
import { useStore } from "../store";

const instance = axios.create({
    baseURL: process.env.BASE_URL || "http://localhost:3001",
    withCredentials: true,
    // timeout: 1000
});

export default function fetch(options: ApiConfigProps) {
    const { userInfo } = useStore();

    if (options.useToken && userInfo.isLogin) {
        options.headers = { Authorization: "Bearer " + userInfo.token };
    }

    return instance(options)
        .then((response) => {
            const { data } = response;
            const { status } = data;
            const success = status === 200 ? true : false;
            if (!success && typeof window !== "undefined") {
                message.error(data.message);
            }
            return Promise.resolve({
                success: success,
                ...data,
            });
        })
        .catch((error) => {
            if (typeof window !== "undefined") {
                message.info(error || "Network Error");
            }
            return Promise.reject();
        });
}
