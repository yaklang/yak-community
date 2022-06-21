import React, { useState } from "react";
import { NextPage } from "next";
import { UserOutlined } from "@ant-design/icons";
import { Form, Upload, message, Input, Button, Breadcrumb, Tabs } from "antd";

import Link from "next/link";
import Avatar from "../components/avatar/Avatar";
import UserLayout from "../components/UserLayout";
import SettingInfo from "../components/userinfo/SettingInfo";
import UserFollow from "../components/userinfo/UserFollow";

const { TabPane } = Tabs;

interface ModifyUserProps {}

const UserInfo: NextPage<ModifyUserProps> = (props) => {
    const [activeKey, setActiveKey] = useState<string>("dynamic");

    return (
        <UserLayout>
            <div className="user-info-wrapper">
                <Avatar
                    info={{
                        isLogin: true,
                        name: "123",
                        header: "321",
                        telephone: "111",
                        githubName: "111",
                        wechatName: null,
                        qqName: "123",
                        role: "123",
                        token: "123",
                    }}
                />
                <Tabs
                    activeKey={activeKey}
                    className="user-info-tabs"
                    onChange={(key: string) => setActiveKey(key)}
                >
                    <TabPane
                        tab={
                            <div className="tabs-bar-title">
                                动态
                                <div
                                    className="title-count"
                                    style={{
                                        right: `${(0 - 4 - 3 * 8) / 16}rem`,
                                    }}
                                >
                                    {123}
                                </div>
                            </div>
                        }
                        key="dynamic"
                    ></TabPane>
                    <TabPane
                        tab={
                            <div className="tabs-bar-title">
                                收藏
                                <div
                                    className="title-count"
                                    style={{
                                        right: `${(0 - 4 - 2 * 8) / 16}rem`,
                                    }}
                                >
                                    {16}
                                </div>
                            </div>
                        }
                        key="collection"
                    ></TabPane>
                    <TabPane
                        tab={
                            <div className="tabs-bar-title">
                                关注
                                <div
                                    className="title-count"
                                    style={{
                                        right: `${(0 - 4 - 2 * 8) / 16}rem`,
                                    }}
                                >
                                    {24}
                                </div>
                            </div>
                        }
                        key="follow"
                    >
                        <UserFollow
                            info={{
                                isLogin: true,
                                name: "123",
                                header: "321",
                                telephone: "111",
                                githubName: "111",
                                wechatName: null,
                                qqName: "123",
                                role: "123",
                                token: "123",
                            }}
                        />
                    </TabPane>
                    <TabPane
                        tab={<div className="tabs-bar-title">资料设置</div>}
                        key="setting"
                    >
                        <SettingInfo
                            info={{
                                isLogin: true,
                                name: "123",
                                header: "321",
                                telephone: "111",
                                githubName: "111",
                                wechatName: null,
                                qqName: "123",
                                role: "123",
                                token: "123",
                            }}
                        />
                    </TabPane>
                </Tabs>
            </div>
        </UserLayout>
    );
};

export default UserInfo;
