import React, { useEffect, useLayoutEffect, useState } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { Tabs } from "antd";
import {} from "@ant-design/icons";
import Avatar from "../components/avatar/Avatar";
import UserLayout from "../components/UserLayout";
import SettingInfo from "../components/userinfo/SettingInfo";
import UserFollow from "../components/userinfo/UserFollow";
import { useRouter } from "next/router";
import { API } from "../types/api";
import { NetWorkApi } from "../utils/fetch";
import { useMemoizedFn } from "ahooks";
import { useStore } from "../store";

const { TabPane } = Tabs;

interface ModifyUserProps {}

interface fetchFanHotProps {
    user_id: number;
    title: 0 | 1;
}

const UserInfo: NextPage<ModifyUserProps> = (props) => {
    const router = useRouter();

    const { userInfo, signIn } = useStore();

    const [activeKey, setActiveKey] = useState<string>("dynamic");
    const [user, setUser] = useState<API.UserDetail>();
    const [userCount, setUserCount] = useState<API.UserHead>();

    useLayoutEffect(() => {
        const { query } = router;
        if (query.tabs) setActiveKey(query.tabs as string);
    }, []);

    const fetchUserInfo = () => {
        NetWorkApi<undefined, API.UserResponse>({
            method: "get",
            url: "/api/forum/user",
            userToken: true,
        })
            .then((res) => {
                signIn({
                    ...userInfo,
                    user_id: res.data.id,
                    name: res.data.name,
                    head_img: res.data.head_img,
                });
                setUser(res.data);
                setTimeout(() => fetchFanHot(), 50);
            })
            .catch((err) => {});
    };

    const fetchFanHot = () => {
        if (!userInfo.user_id) return;
        NetWorkApi<fetchFanHotProps, API.UserHead>({
            method: "get",
            url: "/api/dynamic/user/head",
            params: { user_id: userInfo.user_id, title: 1 },
            userToken: true,
        })
            .then((res) => {
                setUserCount(res);
            })
            .catch((err) => {});
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        const { query } = router;
        setActiveKey(query.tabs as string);
    }, [router]);

    return (
        <UserLayout>
            {user && userCount && (
                <div className="user-info-wrapper">
                    <Avatar info={user} count={userCount} />

                    <Tabs
                        activeKey={activeKey}
                        className="user-info-tabs"
                        onChange={(key: string) => setActiveKey(key)}
                    >
                        <TabPane
                            tab={
                                <div className="tabs-bar-title">
                                    动态
                                    {userCount.dynamic_num !== 0 && (
                                        <div
                                            className="title-count"
                                            style={{
                                                right: `${
                                                    (0 -
                                                        4 -
                                                        `${userCount.dynamic_num}`
                                                            .length *
                                                            8) /
                                                    16
                                                }rem`,
                                            }}
                                        >
                                            {userCount.dynamic_num}
                                        </div>
                                    )}
                                </div>
                            }
                            key="dynamic"
                        ></TabPane>
                        <TabPane
                            tab={
                                <div className="tabs-bar-title">
                                    收藏
                                    {userCount.collect_num !== 0 && (
                                        <div
                                            className="title-count"
                                            style={{
                                                right: `${
                                                    (0 -
                                                        4 -
                                                        `${userCount.collect_num}`
                                                            .length *
                                                            8) /
                                                    16
                                                }rem`,
                                            }}
                                        >
                                            {userCount.collect_num}
                                        </div>
                                    )}
                                </div>
                            }
                            key="collection"
                        ></TabPane>
                        <TabPane
                            tab={
                                <div className="tabs-bar-title">
                                    关注
                                    {userCount.follow_num !== 0 && (
                                        <div
                                            className="title-count"
                                            style={{
                                                right: `${
                                                    (0 -
                                                        4 -
                                                        `${userCount.follow_num}`
                                                            .length *
                                                            8) /
                                                    16
                                                }rem`,
                                            }}
                                        >
                                            {userCount.follow_num}
                                        </div>
                                    )}
                                </div>
                            }
                            key="follow"
                        >
                            <UserFollow
                                info={{
                                    isLogin: true,
                                    user_id: 111,
                                    name: "123",
                                    head_img: "123",
                                }}
                            />
                        </TabPane>
                        <TabPane
                            tab={<div className="tabs-bar-title">资料设置</div>}
                            key="setting"
                        >
                            <SettingInfo
                                info={user}
                                onUpdateUserInfo={fetchUserInfo}
                            />
                        </TabPane>
                    </Tabs>
                </div>
            )}
        </UserLayout>
    );
};

export default UserInfo;
