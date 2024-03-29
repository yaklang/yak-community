import React, { useEffect, useLayoutEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Tabs } from "antd";
import { API } from "../types/api";
import { NetWorkApi } from "../utils/fetch";
import { useStore } from "../store";
import Avatar from "../components/avatar/Avatar";
import UserLayout from "../components/layout/UserLayout";
import SettingInfo from "../components/userinfo/SettingInfo";
import UserFollow from "../components/userinfo/UserFollow";
import UserCollect from "../components/userinfo/UserCollect";
import UserDynamic from "../components/userinfo/UserDynamic";
import { FetchUserFans } from "../types/extraApi";

const { TabPane } = Tabs;

interface ModifyUserProps {}

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

    const fetchUserInfo = (noUpdate?: boolean) => {
        NetWorkApi<undefined, API.UserResponse>({
            method: "get",
            url: "/api/forum/user",
            userToken: true,
        })
            .then((res) => {
                if (noUpdate) {
                    signIn({
                        ...userInfo,
                        name: res.data.name,
                        head_img: res.data.head_img,
                    });
                }
                setUser(res.data);
                fetchFanHot(res.data);
            })
            .catch((err) => {});
    };

    const fetchFanHot = (info: API.UserDetail) => {
        NetWorkApi<FetchUserFans, API.UserHead>({
            method: "get",
            url: "/api/dynamic/user/head",
            params: { user_id: info.id },
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
                    <Avatar
                        id={user.id}
                        name={user.name}
                        img={user.head_img}
                        fans={userCount.fans}
                        follows={userCount.follow_num}
                        goFans={() => {
                            router.push({
                                pathname: "/messagecenter",
                                query: { tabs: "fans" },
                            });
                        }}
                        goFollows={() => {
                            router.push({
                                pathname: "/userinfo",
                                query: { tabs: "follow" },
                            });
                        }}
                    />

                    <Tabs
                        activeKey={activeKey}
                        destroyInactiveTabPane={true}
                        className="user-info-tabs"
                        onChange={(key: string) => {
                            router.push({
                                pathname: "/userinfo",
                                query: { tabs: key },
                            });
                        }}
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
                        >
                            <UserDynamic
                                userId={user.id}
                                onUpdateUserInfo={fetchUserInfo}
                            />
                        </TabPane>
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
                        >
                            <UserCollect
                                info={user}
                                onUpdateUserInfo={fetchUserInfo}
                            />
                        </TabPane>
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
                                userId={user.id}
                                onUpdateUserInfo={fetchUserInfo}
                            />
                        </TabPane>
                        <TabPane
                            tab={<div className="tabs-bar-title">资料设置</div>}
                            key="setting"
                        >
                            <SettingInfo
                                info={user}
                                onUpdateUserInfo={() => fetchUserInfo(true)}
                            />
                        </TabPane>
                    </Tabs>
                </div>
            )}
        </UserLayout>
    );
};

export default UserInfo;
