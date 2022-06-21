import { AxiosRequestConfig } from "axios";

export interface ApiConfigProps extends AxiosRequestConfig {
    useToken?: boolean;
}
