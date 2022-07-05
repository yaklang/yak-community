import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { Button, Divider, Input, Popover } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
    BellOutIcon,
    CollectionIcon,
    CollectionThemeIcon,
    CommunityIcon,
    CommunityThemeIcon,
    FollowIcon,
    FollowThemeIcon,
    FormOutIcon,
    SettingIcon,
    SettingThemeIcon,
    SignOutIcon,
    SignOutThemeIcon,
} from "../public/icons";
import { useRouter } from "next/router";
import { ButtonTheme } from "./baseComponents/ButtonTheme";
import { useMemoizedFn } from "ahooks";
import { useStore } from "../store";
import { TokenKey, UserId, userSignOut } from "../utils/auth";
import { NetWorkApi } from "../utils/fetch";
import { API } from "../types/api";
import PostComment from "./modal/PostComment";

interface HeadersProps {}

const Headers: NextPage<HeadersProps> = (props) => {
    const { userInfo, signIn, signOut } = useStore();

    const headerRef = useRef(null);

    const router = useRouter();

    const [postMessage, setPostMessage] = useState<boolean>(false);

    const [menu1, setMenu1] = useState<boolean>(false);
    const [menu2, setMenu2] = useState<boolean>(false);
    const [menu3, setMenu3] = useState<boolean>(false);
    const [menu4, setMenu4] = useState<boolean>(false);
    const [menuOut, setMenuOut] = useState<boolean>(false);

    const showMenuIcon = useMemoizedFn((index: number) => {
        if (index === 1) setMenu1(!menu1);
        if (index === 2) setMenu2(!menu2);
        if (index === 3) setMenu3(!menu3);
        if (index === 4) setMenu4(!menu4);
        if (index === 5) setMenuOut(!menuOut);
    });

    const userInfoLink = (flag: number) => {
        switch (flag) {
            case 1:
                router.push({
                    pathname: "/userinfo",
                    query: { tabs: "dynamic" },
                });
                break;
            case 2:
                router.push({
                    pathname: "/userinfo",
                    query: { tabs: "collection" },
                });
                break;
            case 3:
                router.push({
                    pathname: "/userinfo",
                    query: { tabs: "follow" },
                });
                break;
            case 4:
                router.push({
                    pathname: "/userinfo",
                    query: { tabs: "setting" },
                });
                break;
        }
    };

    const loginSignOut = () => {
        signOut();
        userSignOut();
        setTimeout(() => {
            router.push("/");
        }, 50);
    };

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

    useLayoutEffect(() => {
        if (!userInfo.isLogin) {
            NetWorkApi<undefined, API.UserResponse>({
                method: "get",
                url: "/api/forum/user",
                userToken: true,
            })
                .then((res) => {
                    signIn({
                        isLogin: true,
                        user_id: res.data.id,
                        name: res.data.name,
                        head_img: res.data.head_img,
                    });
                    console.log("auth", res);
                })
                .catch((err) => {});
        }
    }, [userInfo]);

    return (
        <div
            ref={headerRef}
            className="header-outside header-outside-transparent"
        >
            <div className="header-main">
                <div className="header-left">
                    <a href="/" className="header-left-home-page">
                        <img src="/images/yakLogo.png" className="img-style" />
                    </a>
                    <div className="header-left-community-search">
                        <div
                            className="community-body"
                            onClick={() => router.push("/")}
                        >
                            <CommunityThemeIcon className="community-icon-style" />
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
                        onClick={() => setPostMessage(true)}
                    />
                    <Button
                        icon={<BellOutIcon className="icon-style" />}
                        type="link"
                        className="header-right-bell-out"
                    />
                    {userInfo.isLogin ? (
                        <Popover
                            overlayClassName="user-info-menu"
                            placement="bottomRight"
                            trigger="click"
                            content={
                                <div className="user-info-menu-body">
                                    <ul className="menu-list">
                                        <li
                                            onMouseEnter={() => showMenuIcon(1)}
                                            onMouseLeave={() => showMenuIcon(1)}
                                            onClick={() => userInfoLink(1)}
                                        >
                                            {menu1 ? (
                                                <CommunityThemeIcon className="icon-community-style" />
                                            ) : (
                                                <CommunityIcon className="icon-community-style" />
                                            )}
                                            我的动态
                                        </li>
                                        <li
                                            onMouseEnter={() => showMenuIcon(2)}
                                            onMouseLeave={() => showMenuIcon(2)}
                                            onClick={() => userInfoLink(2)}
                                        >
                                            {menu2 ? (
                                                <CollectionThemeIcon className="icon-style" />
                                            ) : (
                                                <CollectionIcon className="icon-style" />
                                            )}
                                            我的收藏
                                        </li>
                                        <li
                                            onMouseEnter={() => showMenuIcon(3)}
                                            onMouseLeave={() => showMenuIcon(3)}
                                            onClick={() => userInfoLink(3)}
                                        >
                                            {menu3 ? (
                                                <FollowThemeIcon className="icon-style" />
                                            ) : (
                                                <FollowIcon className="icon-style" />
                                            )}
                                            我的关注
                                        </li>
                                        <li
                                            onMouseEnter={() => showMenuIcon(4)}
                                            onMouseLeave={() => showMenuIcon(4)}
                                            onClick={() => userInfoLink(4)}
                                        >
                                            {menu4 ? (
                                                <SettingThemeIcon className="icon-style" />
                                            ) : (
                                                <SettingIcon className="icon-style" />
                                            )}
                                            资料设置
                                        </li>
                                    </ul>
                                    <Divider className="menu-divider" />
                                    <div
                                        className="menu-sign-out"
                                        onMouseEnter={() => showMenuIcon(5)}
                                        onMouseLeave={() => showMenuIcon(5)}
                                        onClick={() => loginSignOut()}
                                    >
                                        {menuOut ? (
                                            <SignOutThemeIcon className="icon-style" />
                                        ) : (
                                            <SignOutIcon className="icon-style" />
                                        )}
                                        退出登录
                                    </div>
                                </div>
                            }
                        >
                            <img
                                src={userInfo.head_img}
                                className="header-right-user-img"
                            />
                        </Popover>
                    ) : (
                        <ButtonTheme
                            className="header-right-login-btn"
                            onClick={() => router.push("/login")}
                        >
                            登录
                        </ButtonTheme>
                    )}
                </div>
            </div>

            <PostComment
                visible={postMessage}
                onCancel={() => setPostMessage(false)}
            />
        </div>
    );
};

export default Headers;
