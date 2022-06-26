import React, { useState } from "react";
import { NextPage } from "next";
import { UserOutlined } from "@ant-design/icons";
import { Form, Upload, message, Input, Button, Breadcrumb, Tabs } from "antd";

import Link from "next/link";
import AvatarCard from "../components/avatar/AvatarCard";
import TopicList from "../components/TopicList";
import { LeftOutThemeIcon } from "../public/icons";
import NoLayout from "../components/NoLayout";
import CommentItem from "../components/CommentItem";

interface DynamicProps {}

const Dynamic: NextPage<DynamicProps> = (props) => {
    const [activeKey, setActiveKey] = useState<string>("like");

    return (
        <NoLayout>
            <div className="dynamic-wrapper">
                <div className="dynamic-back">
                    <div className="dynamic-back-btn">
                        <LeftOutThemeIcon className="icon-style" />
                        &nbsp; 返回
                    </div>
                </div>

                <div className="dynamic-body">
                    <div className="dynamic-comment-body">
                        <CommentItem />
                    </div>
                    <div className="dynamic-author-and-topic">
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
        </NoLayout>
    );
};

export default Dynamic;
