import React, { useState } from "react";
import { NextPage } from "next";
import { UserOutlined } from "@ant-design/icons";
import { Form, Upload, message, Input, Button, Breadcrumb, Tabs } from "antd";

import Link from "next/link";
import UserLayout from "../components/UserLayout";
import SettingInfo from "../components/userinfo/SettingInfo";
import UserFollow from "../components/userinfo/UserFollow";
import Fans from "../components/messageCenter/Fans";

const { TabPane } = Tabs;

interface ModifyUserProps {}

const UserInfo: NextPage<ModifyUserProps> = (props) => {
    const [activeKey, setActiveKey] = useState<string>("like");

    return (
        <div
            style={{
                background: "#F7F8FA",
            }}
        >
            <div className="message-center-wrapper">
                <Tabs
                    activeKey={activeKey}
                    className="message-center-tabs"
                    onChange={(key: string) => setActiveKey(key)}
                >
                    <TabPane
                        tab={
                            <div className="tabs-bar-title">
                                赞
                                <div
                                    className="title-count"
                                    style={{
                                        right: `${(0 - 4 - 4 * 8) / 16}rem`,
                                    }}
                                >
                                    {`999+`}
                                </div>
                            </div>
                        }
                        key="like"
                    ></TabPane>
                    <TabPane
                        tab={
                            <div className="tabs-bar-title">
                                评论
                                <div
                                    className="title-count"
                                    style={{
                                        right: `${(0 - 4 - 2 * 8) / 16}rem`,
                                    }}
                                >
                                    {66}
                                </div>
                            </div>
                        }
                        key="comment"
                    ></TabPane>
                    <TabPane
                        tab={
                            <div className="tabs-bar-title">
                                粉丝
                                <div
                                    className="title-count"
                                    style={{
                                        right: `${(0 - 4 - 2 * 8) / 16}rem`,
                                    }}
                                >
                                    {58}
                                </div>
                            </div>
                        }
                        key="fans"
                    >
                        <Fans />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default UserInfo;
