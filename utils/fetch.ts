import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { failed } from "./notification";
import { getToken } from "./auth";
import { API } from "../types/api";

const instance = axios.create({
    // baseURL: "http://onlinecs.vaiwan.cn/api/",
    withCredentials: true,
    // timeout: 1000
});
instance.interceptors.response.use(
    (res) => {
        if (res.status === 200) return res;
        else
            return Promise.reject({
                code: `${res.status}`,
                response: res,
            } as AxiosError);
    },
    (err) => {
        return Promise.reject(err);
    }
);

interface AxiosConfigProps<T = any> extends AxiosRequestConfig<T> {
    userToken?: boolean;
    params?: T;
}
export function NetWorkApi<T, D>(params: AxiosConfigProps<T>): Promise<D> {
    if (params.userToken) {
        params.headers = { Authorization: getToken() || "", ...params.headers };
        delete params.userToken;
    }

    return new Promise((resolve, reject) => {
        instance(params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((err: any) => {
                handleAxiosError(err);
                reject(err);
            });
    });
}

export const handleAxiosError = (err: any) => {
    const { code, response } = err as AxiosError<API.ActionFailed>;

    if (!code) {
        failed("请求超时，请重试");
        return;
    }
    switch (code) {
        case "209":
            failed(response?.data.reason || "");
            return;
        case "500":
            failed("Token已过期，请重新登录");
            return;

        default:
            break;
    }
};
