import React, { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { Badge, Button, Divider, Input, Popover } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
    BellOutIcon,
    CollectionIcon,
    CommunityIcon,
    CommunityThemeIcon,
    FansIcon,
    FollowIcon,
    FormOutIcon,
    HintIcon,
    LikeIcon,
    ReplyIcon,
    SettingIcon,
    SignOutIcon,
} from "../../public/icons";
import { useRouter } from "next/router";
import { ButtonTheme } from "../baseComponents/ButtonTheme";
import { useMemoizedFn } from "ahooks";
import { useStore } from "../../store";
import { getToken, userSignOut } from "../../utils/auth";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import PostDynamic from "../modal/PostDynamic";
import { ImgShow } from "../baseComponents/ImgShow";
import { success } from "../../utils/notification";

interface HeadersProps {}

// eslint-disable-next-line react/display-name
const Headers: NextPage<HeadersProps> = React.memo((props) => {
    const { userInfo, signIn, signOut, setHomePageKeywords } = useStore();
    const router = useRouter();

    const headerRef = useRef(null);

    const [keywords, setKeywords] = useState<string>("");
    const [showKeywords, setShowKeywords] = useState<boolean>(false);

    const [postMessage, setPostMessage] = useState<boolean>(false);

    // 消息中心控制器
    const [messageNum, setMessageNum] = useState<API.MessageCenter>({
        comment_num: 0,
        fans: 0,
        stars_num: 0,
        delete_message: 0,
    });

    const fetchUnreadMessage = useMemoizedFn(() => {
        NetWorkApi<{ total: boolean }, API.MessageCenter>({
            method: "get",
            url: "/api/message/center",
            userToken: true,
        })
            .then((res) => setMessageNum(res))
            .catch((err) => {});
    });
    useEffect(() => {
        const tokenFlag = !!getToken();
        let messageTime: any = undefined;
        if (tokenFlag) {
            fetchUnreadMessage();
            messageTime = setInterval(() => {
                fetchUnreadMessage();
            }, 60000);
        } else {
            clearInterval(messageTime);
        }

        return () => {
            clearInterval(messageTime);
        };
    }, [userInfo]);

    const userMessageLink = (flag: "like" | "comment" | "fans" | "hint") => {
        setMessageNum({
            comment_num: 0,
            fans: 0,
            stars_num: 0,
            delete_message: 0,
        });
        router.push({
            pathname: "/messagecenter",
            query: { tabs: flag },
        });
    };

    const userInfoLink = (
        flag: "dynamic" | "collection" | "follow" | "setting"
    ) => {
        router.push({
            pathname: "/userinfo",
            query: { tabs: flag },
        });
    };

    const loginSignOut = () => {
        NetWorkApi<undefined, API.ActionSucceeded>({
            method: "get",
            url: "/api/logout",
            userToken: true,
        })
            .then((res) => {
                userSignOut();
                setTimeout(() => {
                    signOut();
                    success("退出登录成功");
                }, 50);
                setTimeout(() => router.push("/"), 50);
            })
            .catch((err) => {});
    };

    const ChangeEvent = useMemoizedFn((e: Event) => {
        if (!e.target) return;
        const target = e.target as Document;
        if (!target.scrollingElement) return;
        const html = target.scrollingElement as HTMLHtmlElement;
        const scrollTop = html.scrollTop;

        if (!headerRef || !headerRef.current) return;
        const header = headerRef.current as unknown as HTMLDivElement;

        const HtmlFontSize = +document.body.style.fontSize.split("px")[0] || 14;

        if (scrollTop >= (376 * HtmlFontSize) / 16) setShowKeywords(true);
        if (scrollTop < (376 * HtmlFontSize) / 16) setShowKeywords(false);

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

    useEffect(() => {
        document.addEventListener("scroll", ChangeEvent);
        return () => {
            document.removeEventListener("scroll", ChangeEvent);
        };
    }, []);

    const fetchUserInfo = useMemoizedFn(() => {
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
                    isRole: res.data.role === "admin",
                });
            })
            .catch((err) => {});
    });

    const Unsubscribe = useMemoizedFn((e: MessageEvent) => {
        if (
            !e.data.isLogin &&
            e.data.code === 500 &&
            e.data.message === "token过期"
        ) {
            signOut();
            setTimeout(() => router.push("/"), 50);
        }
    });

    useEffect(() => {
        const tokenFlag = !!getToken();
        if (tokenFlag) fetchUserInfo();

        if (tokenFlag) {
            NetWorkApi<undefined, API.UserResponse>({
                method: "get",
                url: "/api/refresh/token",
                userToken: true,
            })
                .then((res) => {})
                .catch((err) => {});
        }

        window.addEventListener("message", Unsubscribe);
        return () => {
            window.removeEventListener("message", Unsubscribe);
        };
    }, []);

    return (
        <div
            ref={headerRef}
            className="header-outside header-outside-transparent"
        >
            <div className="header-main">
                <div className="header-left">
                    {/* <a
                        href="https://www.yaklang.io/"
                        className="header-left-home-page"
                    >
                        <img src="/images/yakLogo.png" className="img-style" />
                    </a> */}
                    <div
                        className="community-body"
                        onClick={() => {
                            if (router.pathname === "/") {
                                window.location.reload();
                            } else {
                                router.push("/");
                            }
                        }}
                    >
                        <CommunityThemeIcon className="community-icon-style" />
                        <div className="community-title-style">Ya! 一刻</div>
                    </div>
                    <div className="header-left-community-search">
                        {showKeywords && (
                            <>
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
                                    value={keywords}
                                    onChange={(e) =>
                                        setKeywords(e.target.value)
                                    }
                                    onPressEnter={() =>
                                        setHomePageKeywords({
                                            value: keywords,
                                            trigger: true,
                                        })
                                    }
                                />
                            </>
                        )}
                    </div>
                </div>
                <div className="header-right">
                    {userInfo.isLogin ? (
                        <>
                            <Button
                                icon={<FormOutIcon className="icon-style" />}
                                type="link"
                                className="header-right-form-out"
                                onClick={() => setPostMessage(true)}
                            />
                            <Badge
                                color={"#F73C1B"}
                                dot={
                                    !!(
                                        messageNum.comment_num ||
                                        messageNum.fans ||
                                        messageNum.stars_num ||
                                        messageNum.delete_message
                                    )
                                }
                                offset={[-10, 5]}
                            >
                                <Popover
                                    overlayClassName="user-info-menu"
                                    placement="bottom"
                                    content={
                                        <div className="user-info-menu-body">
                                            <ul className="message-list">
                                                <li
                                                    onClick={() =>
                                                        userMessageLink("like")
                                                    }
                                                >
                                                    <div className="message-title">
                                                        <LikeIcon className="icon-style" />
                                                        赞
                                                    </div>
                                                    {!!messageNum.stars_num && (
                                                        <div className="message-hint">
                                                            {
                                                                messageNum.stars_num
                                                            }
                                                        </div>
                                                    )}
                                                </li>
                                                <li
                                                    onClick={() =>
                                                        userMessageLink(
                                                            "comment"
                                                        )
                                                    }
                                                >
                                                    <div className="message-title">
                                                        <ReplyIcon className="icon-style" />
                                                        评论
                                                    </div>
                                                    {!!messageNum.comment_num && (
                                                        <div className="message-hint">
                                                            {
                                                                messageNum.comment_num
                                                            }
                                                        </div>
                                                    )}
                                                </li>
                                                <li
                                                    onClick={() =>
                                                        userMessageLink("fans")
                                                    }
                                                >
                                                    <div className="message-title">
                                                        <FansIcon className="icon-style" />
                                                        粉丝
                                                    </div>
                                                    {!!messageNum.fans && (
                                                        <div className="message-hint">
                                                            {messageNum.fans}
                                                        </div>
                                                    )}
                                                </li>
                                                <li
                                                    onClick={() =>
                                                        userMessageLink("hint")
                                                    }
                                                >
                                                    <div className="message-title">
                                                        <HintIcon className="icon-style" />
                                                        消息
                                                    </div>
                                                    {!!messageNum.delete_message && (
                                                        <div className="message-hint">
                                                            {
                                                                messageNum.delete_message
                                                            }
                                                        </div>
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    }
                                >
                                    <Button
                                        icon={
                                            <BellOutIcon className="icon-style" />
                                        }
                                        type="link"
                                        className="header-right-bell-out"
                                    />
                                </Popover>
                            </Badge>

                            <Popover
                                overlayClassName="user-info-menu"
                                placement="bottomRight"
                                content={
                                    <div className="user-info-menu-body">
                                        <ul className="menu-list">
                                            <li
                                                onClick={() =>
                                                    userInfoLink("dynamic")
                                                }
                                            >
                                                <CommunityIcon className="icon-style" />
                                                我的动态
                                            </li>
                                            <li
                                                onClick={() =>
                                                    userInfoLink("collection")
                                                }
                                            >
                                                <CollectionIcon className="icon-style" />
                                                我的收藏
                                            </li>
                                            <li
                                                onClick={() =>
                                                    userInfoLink("follow")
                                                }
                                            >
                                                <FollowIcon className="icon-style" />
                                                我的关注
                                            </li>
                                            <li
                                                onClick={() =>
                                                    userInfoLink("setting")
                                                }
                                            >
                                                <SettingIcon className="icon-style" />
                                                资料设置
                                            </li>
                                        </ul>
                                        <Divider className="menu-divider" />
                                        <div
                                            className="menu-sign-out"
                                            onClick={() => loginSignOut()}
                                        >
                                            <SignOutIcon className="icon-style" />
                                            退出登录
                                        </div>
                                    </div>
                                }
                            >
                                <div className="header-right-user-img">
                                    <ImgShow src={userInfo.head_img || ""} />
                                </div>
                            </Popover>
                        </>
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

            {postMessage && (
                <PostDynamic
                    visible={postMessage}
                    onCancel={() => setPostMessage(false)}
                />
            )}
        </div>
    );
});

export default Headers;
