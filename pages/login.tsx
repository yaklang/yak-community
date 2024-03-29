import React, { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Checkbox, Divider, Spin, Tooltip } from "antd";
import {
    GithubOutlined,
    WechatOutlined,
    FormOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { InputTheme } from "../components/baseComponents/InputTheme";
import { ButtonTheme } from "../components/baseComponents/ButtonTheme";
import { useMemoizedFn } from "ahooks";
import { failed, success, warn } from "../utils/notification";
import { NetWorkApi } from "../utils/fetch";
import { API } from "../types/api";
import { useStore } from "../store";
import { setPlatform, setTokenUser, userSignOut } from "../utils/auth";
import { queryURLParams, replaceParamVal } from "../utils/urlTool";
import { SingleUpload } from "../components/baseComponents/SingleUpload";
import { ImgShow } from "../components/baseComponents/ImgShow";
import { LeftOutIcon, RightOutIcon } from "../public/icons";

interface LoginProps {}

type source = "forum_github" | "wechat";

interface FetchCodeUrl {
    source: source;
}
export interface LoginCode {
    code: string;
    type: "github" | "wechat";
}

const Login: NextPage<LoginProps> = (props) => {
    const [page, setPage] = useState<1 | 2 | 3 | 4>(1);
    const [codeUrl, setCodeUrl] = useState<{
        url: string;
        type: source;
    }>({ url: "", type: "forum_github" });
    const [authId, setAuthId] = useState<number>(0);
    const [name, setName] = useState<string>("");
    const [headImg, setHeadImg] = useState<string>("");

    const router = useRouter();

    const wrapperRef = useRef<HTMLDivElement>(null);

    const { userInfo, signIn, signOut, githubAuth, clearGithubAuth } =
        useStore();

    useEffect(() => {
        const { page } = router.query;
        if (
            page &&
            page === "3" &&
            githubAuth.auth_id &&
            githubAuth.name &&
            githubAuth.head_img
        ) {
            setAuthId(githubAuth.auth_id);
            setName(githubAuth.name);
            setHeadImg(githubAuth.head_img);
            setPage(3);
        }
    }, [router]);

    useEffect(() => {
        window.addEventListener(
            "onorientationchange" in window ? "orientationchange" : "resize",
            () => {
                if (!wrapperRef || !wrapperRef.current) return;
                const wrapper = wrapperRef.current;
                wrapper.style.height = `${
                    (document.body.offsetWidth * 1080) / 1920
                }px`;
            }
        );
    }, []);

    const clearPageCache = useMemoizedFn(() => {
        signOut();
        clearGithubAuth();
        setCodeUrl({ url: "", type: "forum_github" });
        setAuthId(0);
        setName("");
        setHeadImg("");
        setPage(1);
        userSignOut();
    });
    const setUserInfo = (info: API.AuthResponse) => {
        setAuthId(info.auth_id);
        setName(info.name);
        setHeadImg(info.head_img);
    };
    const setLoginInfo = (info: API.AuthResponse) => {
        signIn({
            isLogin: true,
            user_id: info.user_id,
            name: info.name,
            head_img: info.head_img,
            isRole: info.role === "admin",
        });
        setUserInfo(info);
        setTokenUser(info.token, `${info.user_id}`);
    };

    const nextStep = useMemoizedFn(
        (params: {
            index: 1 | 2 | 3 | 4;
            source?: source;
            code?: string;
            thirdFlag?: boolean;
            phone?: string;
            phoneCode?: string;
            fourthFlag?: boolean;
            fourthName?: string;
            img?: string;
        }) => {
            const {
                index,
                source,
                code,
                thirdFlag,
                phone,
                phoneCode,
                fourthFlag,
                fourthName,
                img,
            } = params;

            if (index === 1 && source) {
                NetWorkApi<FetchCodeUrl, string>({
                    method: "get",
                    url: "/api/auth/from",
                    params: { source: source },
                })
                    .then((res) => {
                        const redirect_uri = decodeURIComponent(
                            queryURLParams(res)["redirect_uri"]
                        );
                        const newUrl = replaceParamVal(
                            res,
                            "redirect_uri",
                            encodeURIComponent(`${redirect_uri}login`)
                        );
                        setCodeUrl({ url: newUrl, type: source });
                        setTimeout(() => setPage(2), 50);
                    })
                    .catch((err) => {});
            }

            if (index === 2 && code && source) {
                NetWorkApi<LoginCode, API.AuthResponse>({
                    method: "get",
                    url: "/api/auth",
                    params: {
                        code,
                        type: source === "forum_github" ? "wechat" : source,
                    },
                })
                    .then((res) => {
                        setPlatform("wechat");
                        if (!res.user_id) {
                            success("登录成功，新用户正在跳转手机绑定页面");
                            setUserInfo(res);
                            setTimeout(() => setPage(3), 50);
                        } else {
                            setLoginInfo(res);
                            setTimeout(() => router.push("/"), 50);
                        }
                    })
                    .catch((err) => {
                        setTimeout(() => setPage(1), 50);
                    });
            }

            if (index === 3) {
                if (thirdFlag) {
                    if (phone && phoneCode && authId) {
                        NetWorkApi<API.UserLogin, API.AuthResponse>({
                            method: "post",
                            url: "/api/user/login",
                            data: { phone, code: phoneCode, auth_id: authId },
                        })
                            .then((res) => {
                                setLoginInfo(res);
                                clearGithubAuth();
                                setTimeout(() => setPage(4), 50);
                            })
                            .catch((err) => {});
                    } else {
                        failed("请检查输入内容后再次尝试提交");
                    }
                } else {
                    clearPageCache();
                }
            }

            if (index === 4) {
                if (fourthFlag) {
                    if (fourthName && img && userInfo.user_id) {
                        NetWorkApi<API.UpdateUser, API.AuthResponse>({
                            method: "post",
                            url: "/api/forum/user",
                            data: {
                                user_id: userInfo.user_id,
                                name: fourthName,
                                head_img: img,
                            },
                            userToken: true,
                        })
                            .then((res) => {
                                signIn({
                                    ...userInfo,
                                    name: fourthName,
                                    head_img: img,
                                });
                                router.push("/");
                            })
                            .catch((err) => {});
                    } else {
                        failed("请检查输入内容后再次尝试提交");
                    }
                } else {
                    clearPageCache();
                }
            }
        }
    );

    return (
        <div ref={wrapperRef} className="login-wrapper">
            <div className="login-body-wrapper">
                <div className="login-body">
                    {page === 1 && (
                        <LoginFirst
                            onFirst={(source) =>
                                nextStep({ index: 1, source: source })
                            }
                        />
                    )}
                    {page === 2 && (
                        <LoginSecond
                            src={codeUrl}
                            onSecond={(code, source) => {
                                nextStep({
                                    index: 2,
                                    source: source,
                                    code: code,
                                });
                            }}
                        />
                    )}
                    {page === 3 && (
                        <LoginThird
                            authId={authId}
                            onThird={(flag, phone, code) => {
                                nextStep({
                                    index: 3,
                                    thirdFlag: flag,
                                    phone: phone,
                                    phoneCode: code,
                                });
                            }}
                        />
                    )}
                    {page === 4 && (
                        <LoginFourth
                            name={name}
                            headImg={headImg}
                            onFourth={(flag, name, img) => {
                                nextStep({
                                    index: 4,
                                    fourthFlag: flag,
                                    fourthName: name,
                                    img,
                                });
                            }}
                        />
                    )}
                </div>
            </div>

            <img src="/images/yakLogo.png" className="yak-logo-style" />
            <img
                src="/images/login/login-left.png"
                className="login-left-style"
            />
            <img
                src="/images/login/login-right.png"
                className="login-right-style"
            />
        </div>
    );
};

// 传递给app组件的数据
export async function getStaticProps() {
    return {
        props: { isLogin: true },
    };
}

export default Login;

// 登录第一步组件
interface LoginFirstProps {
    onFirst: (source: source) => any;
}
const LoginFirst: React.FC<LoginFirstProps> = (props) => {
    const { onFirst } = props;

    const [checked, setChecked] = useState<boolean>(false);

    const login = useMemoizedFn((source: source) => {
        if (!checked) {
            warn("请阅读并勾选下方协议");
            return;
        }
        if (onFirst) onFirst(source);
    });

    return (
        <>
            <div className="login-title">登录</div>

            <div
                className="login-first-btn"
                onClick={() => login("forum_github")}
            >
                <div className="login-first-btn-title">
                    <GithubOutlined className="icon-style github-style" />
                    使用 GitHub 账号登录
                </div>
                <div>
                    <RightOutIcon className="right-style" />
                </div>
            </div>

            <div className="login-first-btn" onClick={() => login("wechat")}>
                <div className="login-first-btn-title">
                    <WechatOutlined className="icon-style wechat-style" />
                    使用微信账号登录
                </div>
                <div>
                    <RightOutIcon className="right-style" />
                </div>
            </div>

            <div className="login-agreement">
                <Checkbox
                    className="login-agreement-checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                />
                已阅读并同意 Yakit 社区账号&nbsp;
                <Link href="/agreement?type=user" target={"_blank"}>
                    <a target={"_blank"}>服务协议</a>
                </Link>{" "}
                和{" "}
                <Link href="/agreement?type=protection">
                    <a target={"_blank"}>隐私政策</a>
                </Link>
                <div className="login-extra-agreement">
                    <Link href="/agreement?type=platform" target={"_blank"}>
                        <a target={"_blank"}>平台使用原则</a>
                    </Link>
                </div>
            </div>
        </>
    );
};

// 登录第二步组件
interface LoginSecondProps {
    src: { url: string; type: source };
    onSecond: (code: string, source: source) => any;
}
const LoginSecond: React.FC<LoginSecondProps> = (props) => {
    const {
        src: { url, type },
        onSecond,
    } = props;

    useEffect(() => {
        if (!url) return;

        if (type === "wechat") {
            var urls = url.split("?")[1];
            const urlSearchParams = new URLSearchParams(urls);
            const params = Object.fromEntries(urlSearchParams.entries());
            // @ts-ignore
            var obj = new window.WxLogin({
                self_redirect: true,
                id: "wechat-login",
                appid: params.appid,
                scope: params.scope.split("#")[0],
                redirect_uri: params.redirect_uri,
            });
            window.addEventListener("message", (e) => {
                if (
                    e &&
                    e.data &&
                    e.data.code &&
                    e.data.source &&
                    e.data.source === "wechatlogin"
                )
                    onSecond(e.data.code, type);
            });
        }

        if (type === "forum_github") window.location.href = url;
    }, []);

    if (type === "wechat")
        return <div id="wechat-login" className="wechat-login"></div>;

    return (
        <div className="github-login">
            <div className="github-login-wrapper">
                <div className="login-icon-body">
                    <Spin spinning={true} className="login-spin" />
                </div>
                正在跳转登录界面中...
            </div>
        </div>
    );
};

// 登录第三步组件
interface LoginThirdProps {
    authId: number;
    onThird: (flag: boolean, phone?: string, code?: string) => any;
}
interface FetchPhoneCode {
    phone: string;
    auth_id: number;
}
const LoginThird: React.FC<LoginThirdProps> = (props) => {
    const { authId, onThird } = props;
    const reg = /^1[3456789][0-9]{9}$/;

    const [phone, setPhone] = useState<string>("");
    const [phoneFlag, setPhoneFlag] = useState<boolean>(true);

    const [code, setCode] = useState<string>("");
    const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
    const [time, setTime] = useState<number>(180);
    const codeTime = useRef<any>(null);
    const codeTimeCount = useRef<number>(180);

    const clearTime = () => {
        clearInterval(codeTime.current);
        codeTime.current = null;
        codeTimeCount.current = 180;
        setTime(180);
        setBtnDisabled(false);
    };

    const sendNote = useMemoizedFn(() => {
        if (!phone || phone.length !== 11 || !reg.test(phone)) {
            setPhoneFlag(false);
            return;
        }
        if (btnDisabled && codeTimeCount.current >= 1) return;

        if (codeTime.current) clearTime();
        setBtnDisabled(true);
        codeTime.current = setInterval(() => {
            const value = codeTimeCount.current - 1;
            codeTimeCount.current = value;
            setTime(value);

            if (value === 0) clearTime();
        }, 1000);

        NetWorkApi<FetchPhoneCode, API.ActionSucceeded>({
            method: "get",
            url: "/api/user_auth/code",
            params: { phone: phone, auth_id: authId },
        })
            .then((res) => {})
            .catch((err) => {
                clearTime();
                failed("获取验证码次数过多，请等几分钟后重试");
            });
    });

    const login = useMemoizedFn(() => {
        if (!phone || phone.length !== 11 || !reg.test(phone)) {
            failed("请输入正确的电话号码");
            return;
        }
        if (!code) {
            failed("请输入验证码");
            return;
        }

        onThird(true, phone, code);
    });

    return (
        <>
            <div className="login-title login-title-third">
                <a
                    href="#"
                    onClick={(e) => {
                        e.stopPropagation();
                        onThird(false);
                    }}
                >
                    <LeftOutIcon className="icon-style" />
                </a>
                绑定手机号
            </div>

            <div className="login-third-input">
                <InputTheme
                    className="input-style"
                    isTheme={false}
                    isLogin={true}
                    prefix={
                        <div>
                            +86
                            <Divider
                                type="vertical"
                                className="divider-style"
                            />
                        </div>
                    }
                    suffix={
                        phoneFlag ? (
                            <></>
                        ) : (
                            <Tooltip
                                placement="top"
                                title="请输入正确的手机号码"
                            >
                                <ExclamationCircleOutlined className="info-style" />
                            </Tooltip>
                        )
                    }
                    placeholder="请输入要绑定的手机号"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "");
                        const flag = value.length !== 11 || reg.test(value);
                        setPhoneFlag(flag);
                        setPhone(value);
                    }}
                />
            </div>

            <div className="login-third-code">
                <InputTheme
                    className="input-style"
                    isTheme={false}
                    isLogin={true}
                    placeholder="验证码"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.replace(/[^\d]/g, ""));
                    }}
                />
                <ButtonTheme
                    className={`btn-style ${
                        btnDisabled ? "btn-disabled-style" : ""
                    }`}
                    disabled={btnDisabled}
                    onClick={() => sendNote()}
                >
                    {btnDisabled ? `${time}s` : "发送"}
                </ButtonTheme>
            </div>

            <div className="login-third-btn">
                <ButtonTheme className="btn-style" onClick={() => login()}>
                    登录
                </ButtonTheme>
            </div>
        </>
    );
};

// 登录第四步组件
interface LoginFourthProps {
    name: string;
    headImg: string;
    onFourth: (flag: boolean, name?: string, img?: string) => any;
}
const LoginFourth: React.FC<LoginFourthProps> = (props) => {
    const { name, headImg, onFourth } = props;

    const [userName, setUserName] = useState<string>(name.slice(0, 30));
    const [img, setImg] = useState<string>(headImg);
    const [imgLoading, setImgLoading] = useState<boolean>(false);
    const [showUpload, setShowUpload] = useState<boolean>(false);

    const login = useMemoizedFn(() => {
        if (!userName) {
            failed("请输入用户名");
            return;
        }

        onFourth(true, userName, img);
    });

    return (
        <>
            <div className="login-title login-title-fourth">
                <a
                    href="#"
                    onClick={(e) => {
                        e.stopPropagation();
                        onFourth(false);
                    }}
                >
                    <LeftOutIcon className="icon-style" />
                </a>
                基本信息
            </div>

            <Spin spinning={imgLoading}>
                <div
                    className="login-fourth-img"
                    onMouseEnter={() => setShowUpload(true)}
                    onMouseLeave={() => setShowUpload(false)}
                >
                    <ImgShow src={img} />

                    <SingleUpload
                        setValue={(res) => setImg(res)}
                        onProgress={() => setImgLoading(true)}
                        onSuccess={() => setImgLoading(false)}
                    >
                        {showUpload && (
                            <div className="login-fourth-img-upload">
                                <FormOutlined className="icon-style" />
                                更改
                            </div>
                        )}
                    </SingleUpload>
                </div>
            </Spin>

            <div className="login-fourth-name">
                <InputTheme
                    className="input-style"
                    isTheme={false}
                    isLogin={true}
                    prefix={
                        <div>
                            昵称
                            <Divider
                                type="vertical"
                                className="divider-style"
                            />
                        </div>
                    }
                    placeholder="请输入昵称"
                    maxLength={30}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
            </div>

            <div className="login-fourth-btn">
                <ButtonTheme className="btn-style" onClick={() => login()}>
                    确认
                </ButtonTheme>
            </div>
        </>
    );
};
