import React, { ReactNode, useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { Badge, Button, Divider, Input, Popover } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
    BellOutIcon,
    CollectionIcon,
    CollectionThemeIcon,
    CommunityIcon,
    CommunityThemeIcon,
    FansIcon,
    FansThemeIcon,
    FollowIcon,
    FollowThemeIcon,
    FormOutIcon,
    LikeIcon,
    LikeThemeIcon,
    ReplyIcon,
    ReplyThemeIcon,
    SettingIcon,
    SettingThemeIcon,
    SignOutIcon,
    SignOutThemeIcon,
} from "../../public/icons";
import { useRouter } from "next/router";
import { ButtonTheme } from "../baseComponents/ButtonTheme";
import { useMemoizedFn } from "ahooks";
import { useStore } from "../../store";
import { getToken, userSignOut } from "../../utils/auth";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import PostDynamic from "../modal/PostDynamic";

interface MessageMenuProps {
    name: string;
    icon: ReactNode;
    themeIcon: ReactNode;
}

const MessageMenu: MessageMenuProps[] = [
    {
        name: "赞",
        icon: <LikeIcon className="icon-style" />,
        themeIcon: <LikeThemeIcon className="icon-style" />,
    },
    {
        name: "评论",
        icon: <ReplyIcon className="icon-style" />,
        themeIcon: <ReplyThemeIcon className="icon-style" />,
    },
    {
        name: "粉丝",
        icon: <FansIcon className="icon-style" />,
        themeIcon: <FansThemeIcon className="icon-style" />,
    },
];

interface HeadersProps {}

const Headers: NextPage<HeadersProps> = (props) => {
    const { userInfo, signIn, signOut, setHomePageKeywords } = useStore();

    const headerRef = useRef(null);

    const router = useRouter();

    const [keywords, setKeywords] = useState<string>("");
    const [showKeywords, setShowKeywords] = useState<boolean>(false);

    const [postMessage, setPostMessage] = useState<boolean>(false);

    const [messageNum, setMessageNum] = useState<API.MessageCenter>({
        comment_num: 0,
        fans: 0,
        stars_num: 0,
    });
    const [like, setLike] = useState<boolean>(false);
    const [comment, setComment] = useState<boolean>(false);
    const [fans, setFans] = useState<boolean>(false);

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
        let messageTime: any = undefined;
        if (userInfo.isLogin) {
            fetchUnreadMessage();
            messageTime = setInterval(() => {
                fetchUnreadMessage();
            }, 10000);
        } else {
            clearInterval(messageTime);
            setTimeout(() => router.push("/"), 50);
        }

        return () => {
            clearInterval(messageTime);
        };
    }, [userInfo]);
    const showMessageIcon = useMemoizedFn((index: number) => {
        if (index === 1) setLike(!like);
        if (index === 2) setComment(!comment);
        if (index === 3) setFans(!fans);
    });
    const userMessageLink = (flag: number) => {
        switch (flag) {
            case 1:
                setMessageNum({
                    comment_num: 0,
                    fans: 0,
                    stars_num: 0,
                });
                router.push({
                    pathname: "/messagecenter",
                    query: { tabs: "like" },
                });
                break;
            case 2:
                setMessageNum({
                    comment_num: 0,
                    fans: 0,
                    stars_num: 0,
                });
                router.push({
                    pathname: "/messagecenter",
                    query: { tabs: "comment" },
                });
                break;
            case 3:
                setMessageNum({
                    comment_num: 0,
                    fans: 0,
                    stars_num: 0,
                });
                router.push({
                    pathname: "/messagecenter",
                    query: { tabs: "fans" },
                });
                break;
        }
    };

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
        NetWorkApi<undefined, API.ActionSucceeded>({
            method: "get",
            url: "/api/logout",
            userToken: true,
        })
            .then((res) => {
                signOut();
                userSignOut();
                setTimeout(() => router.push("/"), 50);
            })
            .catch((err) => {});
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

            if (scrollTop >= 376) setShowKeywords(true);
            if (scrollTop < 376) setShowKeywords(false);

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

    useEffect(() => {
        const tokenFlag = !!getToken();
        if (tokenFlag) {
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
                })
                .catch((err) => {});
        }
    }, []);

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
                                        messageNum.stars_num
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
                                                    onMouseEnter={() =>
                                                        showMessageIcon(1)
                                                    }
                                                    onMouseLeave={() =>
                                                        showMessageIcon(1)
                                                    }
                                                    onClick={() =>
                                                        userMessageLink(1)
                                                    }
                                                >
                                                    <div className="message-title">
                                                        {like ? (
                                                            <LikeThemeIcon className="icon-style" />
                                                        ) : (
                                                            <LikeIcon className="icon-style" />
                                                        )}
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
                                                    onMouseEnter={() =>
                                                        showMessageIcon(2)
                                                    }
                                                    onMouseLeave={() =>
                                                        showMessageIcon(2)
                                                    }
                                                    onClick={() =>
                                                        userMessageLink(2)
                                                    }
                                                >
                                                    <div className="message-title">
                                                        {comment ? (
                                                            <ReplyThemeIcon className="icon-style" />
                                                        ) : (
                                                            <ReplyIcon className="icon-style" />
                                                        )}
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
                                                    onMouseEnter={() =>
                                                        showMessageIcon(3)
                                                    }
                                                    onMouseLeave={() =>
                                                        showMessageIcon(3)
                                                    }
                                                    onClick={() =>
                                                        userMessageLink(3)
                                                    }
                                                >
                                                    <div className="message-title">
                                                        {fans ? (
                                                            <FansThemeIcon className="icon-style" />
                                                        ) : (
                                                            <FansIcon className="icon-style" />
                                                        )}
                                                        粉丝
                                                    </div>
                                                    {!!messageNum.fans && (
                                                        <div className="message-hint">
                                                            {messageNum.fans}
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
                                                onMouseEnter={() =>
                                                    showMenuIcon(1)
                                                }
                                                onMouseLeave={() =>
                                                    showMenuIcon(1)
                                                }
                                                onClick={() => userInfoLink(1)}
                                            >
                                                {menu1 ? (
                                                    <CommunityThemeIcon className="icon-style" />
                                                ) : (
                                                    <CommunityIcon className="icon-style" />
                                                )}
                                                我的动态
                                            </li>
                                            <li
                                                onMouseEnter={() =>
                                                    showMenuIcon(2)
                                                }
                                                onMouseLeave={() =>
                                                    showMenuIcon(2)
                                                }
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
                                                onMouseEnter={() =>
                                                    showMenuIcon(3)
                                                }
                                                onMouseLeave={() =>
                                                    showMenuIcon(3)
                                                }
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
                                                onMouseEnter={() =>
                                                    showMenuIcon(4)
                                                }
                                                onMouseLeave={() =>
                                                    showMenuIcon(4)
                                                }
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

            <PostDynamic
                visible={postMessage}
                onCancel={() => setPostMessage(false)}
            />
        </div>
    );
};

export default Headers;
