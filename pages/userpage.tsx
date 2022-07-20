import React, { useEffect, useState } from "react";
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

const { TabPane } = Tabs;

interface UserPageProps {}

const UserPage: NextPage<UserPageProps> = (props) => {
    const router = useRouter();

    const [user, setUser] = useState<API.UserHead>();

    const fetchUserInfo = useMemoizedFn((id: number) => {
        NetWorkApi<FetchUserFans, API.UserHead>({
            method: "get",
            url: "/api/dynamic/user/head",
            params: { user_id: id },
            userToken: true,
        })
            .then((res) => {
                setUser(res);
            })
            .catch((err) => {});
    });

    useEffect(() => {
        const user = router.query.user;
        if (!user) return;

        fetchUserInfo(+(user as string));
    }, [router]);

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
                    />

                    <Tabs activeKey="dynamic" className="user-page-tabs">
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
                            <UserDynamic
                                userId={user.user_id}
                                onlyShow={true}
                                onUpdateUserInfo={() =>
                                    fetchUserInfo(user.user_id)
                                }
                            />
                        </TabPane>
                    </Tabs>
                </div>
            )}
        </UserLayout>
    );
};

export default UserPage;
