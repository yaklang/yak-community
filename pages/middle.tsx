import React, { useEffect, useRef } from "react";
import { NextPage } from "next";
import { NetWorkApi } from "../utils/fetch";
import { LoginCode } from "./login";
import { API } from "../types/api";
import { queryURLParams } from "../utils/urlTool";
import { failed, success } from "../utils/notification";
import { useStore } from "../store";
import { setPlatform, setTokenUser } from "../utils/auth";
import { useRouter } from "next/router";
import { UpdateAuthProps } from "../types/extraApi";

interface MiddleProps {}

const Middle: NextPage<MiddleProps> = (props) => {
    const { signIn, githubAuth, setGithubAuth, clearGithubAuth } = useStore();

    const router = useRouter();

    const timeRef = useRef<number>(0);

    useEffect(() => {
        const url = window.location.href;
        const params = queryURLParams(url);
        const source = params.source;
        const code = params.code;

        const time = setInterval(() => {
            if (timeRef.current >= 60) {
                clearInterval(time);
                failed("登录超时，请重新登录");
                router.push(
                    source.indexOf("auth") > -1
                        ? {
                              pathname: "/userinfo",
                              query: { tabs: "setting" },
                          }
                        : "/login"
                );
            }
            timeRef.current = timeRef.current + 1;
        }, 1000);

        if (source === "wechatlogin" || source === "wechatauth") {
            window.parent.postMessage({ source, code }, "*");
        }

        if (source === "githublogin") {
            NetWorkApi<LoginCode, API.AuthResponse>({
                method: "get",
                url: "/api/auth",
                params: { code, type: "github" },
            })
                .then((res) => {
                    clearInterval(time);
                    setPlatform("github");
                    if (!res.user_id) {
                        success("登录成功，新用户正在跳转手机绑定页面");
                        setGithubAuth({
                            auth_id: res.auth_id,
                            name: res.name,
                            head_img: res.head_img,
                        });
                        setTimeout(() => router.push("/login?page=3"), 50);
                    } else {
                        signIn({
                            isLogin: true,
                            user_id: res.user_id,
                            name: res.name,
                            head_img: res.head_img,
                            isRole: res.role === "admin",
                        });
                        setTokenUser(res.token, `${res.user_id}`);
                        setTimeout(() => router.push("/"), 50);
                    }
                })
                .catch((err) => {
                    setTimeout(() => router.push("/login"), 50);
                });
        }

        if (source === "githubauth") {
            NetWorkApi<UpdateAuthProps, API.ActionSucceeded>({
                method: "get",
                url: "/api/update/auth",
                params: { code, type: "github", auth_id: githubAuth.auth_id },
                userToken: true,
            })
                .then((res) => {
                    clearInterval(time);
                    clearGithubAuth();
                })
                .catch((err) => {})
                .finally(() => {
                    setTimeout(
                        () =>
                            router.push({
                                pathname: "/userinfo",
                                query: { tabs: "setting" },
                            }),
                        50
                    );
                });
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
                    正在登录验证中，请稍等片刻......
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
