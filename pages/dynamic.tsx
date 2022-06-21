import React, { useState } from "react";
import { NextPage } from "next";
import { UserOutlined } from "@ant-design/icons";
import { Form, Upload, message, Input, Button, Breadcrumb, Tabs } from "antd";

import Link from "next/link";
import AvatarCard from "../components/avatar/AvatarCard";
import TopicList from "../components/TopicList";
import { LeftOutThemeIcon } from "../public/icons";

interface DynamicProps {}

const Dynamic: NextPage<DynamicProps> = (props) => {
    const [activeKey, setActiveKey] = useState<string>("like");

    return (
        <div
            style={{
                background: "#F7F8FA",
            }}
        >
            <div className="dynamic-wrapper">
                <div className="dynamic-back">
                    <div className="dynamic-back-btn">
                        <LeftOutThemeIcon className="icon-style" />
                        &nbsp; 返回
                    </div>
                </div>
                <div>
                    <div></div>
                    <div>
                        <div>
                            <AvatarCard
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
                        </div>
                        <div>
                            <TopicList />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dynamic;
