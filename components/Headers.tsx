import React, { useEffect, useRef } from "react";
import { NextPage } from "next";
import { Button, Divider, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { BellOutIcon, CommunityIcon, FormOutIcon } from "../public/icons";
import { useRouter } from "next/router";

interface HeadersProps {}

const Headers: NextPage<HeadersProps> = (props) => {
    const headerRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        document.addEventListener("scroll", (e) => {
            if (!e.target) return;
            const target = e.target as Document;
            if (!target.scrollingElement) return;
            const html = target.scrollingElement as HTMLHtmlElement;
            const scrollTop = html.scrollTop;

            if (!headerRef || !headerRef.current) return;
            const header = headerRef.current as unknown as HTMLDivElement;

            if (
                scrollTop >= header.offsetHeight &&
                header.className.indexOf("header-outside-transparent") > -1
            ) {
                header.className = "header-outside header-outside-white";
            }
            if (
                scrollTop < header.offsetHeight &&
                header.className.indexOf("header-outside-white") > -1
            ) {
                header.className = "header-outside header-outside-transparent";
            }
        });
    }, []);

    return (
        <div
            ref={headerRef}
            className="header-outside header-outside-transparent"
        >
            <div className="header-main">
                <div className="header-left">
                    <a href="/" className="header-left-home-page">
                        <img
                            src="/images/home/yakLogo.png"
                            className="img-style"
                        />
                    </a>
                    <div className="header-left-community-search">
                        <div
                            className="community-body"
                            onClick={() => router.push("/")}
                        >
                            <CommunityIcon className="community-icon-style" />
                            <div className="community-title-style">
                                Yak 社区
                            </div>
                        </div>
                        <Divider
                            type="vertical"
                            className="community-divider"
                        />
                        <Input
                            className="community-input"
                            placeholder="搜索..."
                            allowClear={true}
                            prefix={
                                <SearchOutlined className="community-input-icon" />
                            }
                        />
                    </div>
                </div>
                <div className="header-right">
                    <Button
                        icon={<FormOutIcon className="icon-style" />}
                        type="link"
                        className="header-right-form-out"
                    />
                    <Button
                        icon={<BellOutIcon className="icon-style" />}
                        type="link"
                        className="header-right-bell-out"
                    />
                    <Button className="header-right-login-btn" type="link">
                        登录
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Headers;
