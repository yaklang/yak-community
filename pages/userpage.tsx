import React, { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { Tabs } from "antd";
import Avatar from "../components/avatar/Avatar";
import UserLayout from "../components/layout/UserLayout";
import { useRouter } from "next/router";
import { API } from "../types/api";
import { NetWorkApi } from "../utils/fetch";
import { useMemoizedFn } from "ahooks";
import { FetchUserFans } from "../types/extraApi";
import { LeftOutThemeIcon } from "../public/icons";
import UserDynamic from "../components/userinfo/UserDynamic";
import UserFollow from "../components/userinfo/UserFollow";
import Fans from "../components/messageCenter/Fans";
import { useStore } from "../store";

const { TabPane } = Tabs;

interface UserPageProps {}

const UserPage: NextPage<UserPageProps> = (props) => {
    const router = useRouter();
    const { userInfo } = useStore();

    const userIdRef = useRef<number>(0);

    const [user, setUser] = useState<API.UserHead>();
    const fetchUserInfo = useMemoizedFn((id: number, tabs?: string) => {
        NetWorkApi<FetchUserFans, API.UserHead>({
            method: "get",
            url: "/api/dynamic/user/head",
            params: { user_id: id },
            userToken: true,
        })
            .then((res) => {
                setUser(res);
                if (tabs) setActiveKey(tabs);
            })
            .catch((err) => {});
    });
    const fetchUnloggedUserInfo = useMemoizedFn(
        (user: number, tabs?: string) => {
            NetWorkApi<FetchUserFans, API.UserHead>({
                method: "get",
                url: "/api/dynamic/user/head/unlogged",
                params: { user_id: user },
            })
                .then((res) => {
                    setUser(res);
                    if (tabs) setActiveKey(tabs);
                })
                .catch((err) => {});
        }
    );
    useEffect(() => {
        const { user, tabs } = router.query;
        if (!user) return;
        userIdRef.current = +user || 0;
        let tabName = "";
        if (tabs === "dynamic" || tabs === "follow" || tabs === "fans")
            tabName = tabs;

        if (userInfo.isLogin) fetchUserInfo(+(user as string), tabName);
        else fetchUnloggedUserInfo(+(user as string), tabName);
    }, [router]);

    const [activeKey, setActiveKey] = useState<string>("dynamic");

    return (
        <UserLayout>
            <div className="user-page-back">
                <div
                    className="user-page-back-btn"
                    onClick={() => router.push("/")}
                >
                    <LeftOutThemeIcon className="icon-style" />
                    &nbsp; 返回
                </div>
            </div>

            {user && (
                <div className="user-page-wrapper">
                    <Avatar
                        id={user.user_id}
                        name={user.user_name}
                        img={user.head_img}
                        fans={user.fans}
                        follows={user.follow_num}
                        isFollow={user.is_follow}
                        showFollow={true}
                        updateInfo={() => fetchUserInfo(user.user_id)}
                        goFans={() => setActiveKey("fans")}
                        goFollows={() => setActiveKey("follow")}
                    />

                    <Tabs
                        className="user-page-tabs"
                        destroyInactiveTabPane={true}
                        activeKey={activeKey}
                        onChange={(key: string) => {
                            if (userIdRef.current) {
                                router.push({
                                    pathname: "/userpage",
                                    query: {
                                        user: userIdRef.current,
                                        tabs: key,
                                    },
                                });
                            } else {
                                setActiveKey(key);
                            }
                        }}
                    >
                        <TabPane
                            tab={
                                <div className="tabs-bar-title">
                                    动态
                                    {user.dynamic_num !== 0 && (
                                        <div
                                            className="title-count"
                                            style={{
                                                right: `${
                                                    (0 -
                                                        4 -
                                                        `${user.dynamic_num}`
                                                            .length *
                                                            8) /
                                                    16
                                                }rem`,
                                            }}
                                        >
                                            {user.dynamic_num}
                                        </div>
                                    )}
                                </div>
                            }
                            key="dynamic"
                        >
                            {user.user_id && (
                                <UserDynamic
                                    userId={user.user_id}
                                    isFollow={user.is_follow}
                                    onlyShow={true}
                                    onUpdateUserInfo={() => {}}
                                />
                            )}
                        </TabPane>
                        <TabPane
                            tab={
                                <div className="tabs-bar-title">
                                    关注
                                    {user.dynamic_num !== 0 && (
                                        <div
                                            className="title-count"
                                            style={{
                                                right: `${
                                                    (0 -
                                                        4 -
                                                        `${user.follow_num}`
                                                            .length *
                                                            8) /
                                                    16
                                                }rem`,
                                            }}
                                        >
                                            {user.follow_num}
                                        </div>
                                    )}
                                </div>
                            }
                            key="follow"
                        >
                            {user.user_id && (
                                <UserFollow
                                    userId={user.user_id}
                                    onlyShow={true}
                                    onUpdateUserInfo={() => {}}
                                />
                            )}
                        </TabPane>
                        <TabPane
                            tab={
                                <div className="tabs-bar-title">
                                    粉丝
                                    {user.dynamic_num !== 0 && (
                                        <div
                                            className="title-count"
                                            style={{
                                                right: `${
                                                    (0 -
                                                        4 -
                                                        `${user.fans}`.length *
                                                            8) /
                                                    16
                                                }rem`,
                                            }}
                                        >
                                            {user.fans}
                                        </div>
                                    )}
                                </div>
                            }
                            key="fans"
                        >
                            {user.user_id && (
                                <Fans userId={user.user_id} onlyShow={true} />
                            )}
                        </TabPane>
                    </Tabs>
                </div>
            )}
        </UserLayout>
    );
};

export default UserPage;
