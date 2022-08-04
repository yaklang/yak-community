import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { failed } from "./notification";
import { getToken, userSignOut } from "./auth";
import { API } from "../types/api";

const instance = axios.create({
    // baseURL: "http://onlinecs.vaiwan.cn/api/",
    withCredentials: true,
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
    const { response } = err as AxiosError<API.ActionFailed>;

    if (!response) {
        failed("请求超时，请重试");
        return;
    }

    switch (response.status) {
        case 209:
            failed(response?.data.reason || "");
            return;
        case 500:
            if ((response as any)?.data?.message === "token过期") {
                userSignOut();
                window.postMessage(
                    { isLogin: false, code: 500, message: "token过期" },
                    window.location.href
                );
                failed("登录已过期，请重新登录");
            } else {
                failed((response as any)?.data?.message || "请求超时，请重试");
            }
            return;

        default:
            if (response.data === undefined) failed("网络异常，请重试");
            if (typeof response.data === "string") failed(response?.data || "");
            else failed((response as any)?.data?.message || "");

            break;
    }
};
