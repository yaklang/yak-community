import React, { useEffect } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { NetWorkApi } from "../utils/fetch";
import { LoginCode } from "./login";
import { API } from "../types/api";

const queryURLParams = (url: string) => {
    var urls = url.split("?")[1];
    const urlSearchParams = new URLSearchParams(urls);
    const params = Object.fromEntries(urlSearchParams.entries());
    return params;
};

interface MiddleProps {}

const Middle: NextPage<MiddleProps> = (props) => {
    useEffect(() => {
        const url = window.location.href;
        const params = queryURLParams(url);
        const source = params.source;
        const code = params.code;

        if (source === "wechat") {
            window.parent.postMessage({ source, code }, "*");
        }
        if (source === "github") {
            NetWorkApi<LoginCode, API.AuthResponse>({
                method: "get",
                url: "/api/auth",
                params: { code, type: source },
            })
                .then((res) => {
                    console.log("github", res);
                })
                .catch((err) => {});
        }
    }, []);

    return (
        <div className="login-middle-body">
            <div className="middle-loading-body">
                <div className="multi-spinner-container">
                    <div className="multi-spinner">
                        <div className="multi-spinner">
                            <div className="multi-spinner">
                                <div className="multi-spinner">
                                    <div className="multi-spinner">
                                        <div className="multi-spinner"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="loading-body-title">
                    正在登录验证中，请稍等片刻。。。。。。
                </div>
            </div>
        </div>
    );
};

export default Middle;

// 传递给app组件的数据
export async function getStaticProps() {
    return {
        props: { isMiddle: true },
    };
}
