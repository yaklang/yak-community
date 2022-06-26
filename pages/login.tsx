import React, { useState } from "react";
import { NextPage } from "next";
import { Checkbox, Divider } from "antd";
import {
    GithubOutlined,
    WechatOutlined,
    RightOutlined,
    ArrowLeftOutlined,
    FormOutlined,
} from "@ant-design/icons";
import { InputTheme } from "../components/baseComponents/InputTheme";
import { ButtonTheme } from "../components/baseComponents/ButtonTheme";
import Link from "next/link";
import { useMemoizedFn } from "ahooks";
import { warn } from "../components/baseComponents/notification";

interface LoginProps {}

const Login: NextPage<LoginProps> = (props) => {
    const [page, setPage] = useState<1 | 2 | 3 | 4>(1);

    return (
        <div className="login-wrapper">
            <div className="login-body">
                {page === 1 && <LoginFirst onFirst={() => setPage(3)} />}
                {page === 3 && <LoginThird onThird={() => setPage(4)} />}
                {page === 4 && <LoginFourth />}
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
    onFirst: () => any;
}
const LoginFirst: React.FC<LoginFirstProps> = (props) => {
    const { onFirst } = props;

    const [checked, setChecked] = useState<boolean>(false);

    const login = useMemoizedFn(() => {
        if (!checked) {
            warn("请阅读并勾选下方协议");
            return;
        }
        if (onFirst) onFirst();
    });

    return (
        <>
            <div className="login-title">登录</div>

            <div className="login-first-btn" onClick={() => login()}>
                <div className="login-first-btn-title">
                    <GithubOutlined className="icon-style github-style" />
                    使用 GitHub 账号登录
                </div>
                <div>
                    <RightOutlined className="right-style" />
                </div>
            </div>

            <div className="login-first-btn" onClick={() => login()}>
                <div className="login-first-btn-title">
                    <WechatOutlined className="icon-style wechat-style" />
                    使用微信账号登录
                </div>
                <div>
                    <RightOutlined className="right-style" />
                </div>
            </div>

            <div className="login-agreement">
                <Checkbox
                    className="login-agreement-checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                />
                已阅读并同意 Yakit 社区账号&nbsp;
                <a href="#">用户协议 </a> 和 <a href="#">隐私政策</a>
            </div>
        </>
    );
};

// 登录第三步组件
interface LoginThirdProps {
    onThird: () => any;
}
const LoginThird: React.FC<LoginThirdProps> = (props) => {
    const { onThird } = props;

    const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
    const [time, setTime] = useState<number>(60);

    const sendNote = () => {};

    return (
        <>
            <div className="login-title">
                <a href="#">
                    <ArrowLeftOutlined className="icon-style" />
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
                    placeholder="请输入已绑定的手机号"
                />
            </div>

            <div className="login-third-code">
                <InputTheme
                    className="input-style"
                    isTheme={false}
                    isLogin={true}
                    placeholder="验证码"
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
                <ButtonTheme className="btn-style">登录</ButtonTheme>
            </div>
        </>
    );
};

// 登录第三步组件
interface LoginFourthProps {}
const LoginFourth: React.FC<LoginFourthProps> = (props) => {
    return (
        <>
            <div className="login-title">
                <a href="#">
                    <ArrowLeftOutlined className="icon-style" />
                </a>
                基本信息
            </div>

            <div className="login-fourth-img">
                <img
                    src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fm00%2Fe7%2Ff5%2F4be82635b9cf81ffdc1dd0e0f0204b51.jpg&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1658389880&t=214ecc64fa096ade8404bd642578664b"
                    className="img-style"
                />
                <div className="login-fourth-img-upload">
                    <FormOutlined className="icon-style" />
                    更改
                </div>
            </div>

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
                />
            </div>

            <div className="login-fourth-btn">
                <ButtonTheme className="btn-style">确认</ButtonTheme>
            </div>
        </>
    );
};
