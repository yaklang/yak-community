import React, { useEffect, useLayoutEffect, useState } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import {} from "@ant-design/icons";
import { Tabs } from "antd";
import NoLayout from "../components/NoLayout";
import Fans from "../components/messageCenter/Fans";
import MessageLike from "../components/messageCenter/MessageLike";
import MessageComment from "../components/messageCenter/MessageComment";

const { TabPane } = Tabs;

interface MessageCenterProps {}

const MessageCenter: NextPage<MessageCenterProps> = (props) => {
    const router = useRouter();

    const [activeKey, setActiveKey] = useState<string>("like");

    useLayoutEffect(() => {
        const { query } = router;
        if (query.tabs) setActiveKey(query.tabs as string);
    }, []);

    useEffect(() => {
        const { query } = router;
        setActiveKey(query.tabs as string);
    }, [router]);

    return (
        <NoLayout>
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
                    >
                        <MessageLike />
                    </TabPane>
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
                    >
                        <MessageComment />
                    </TabPane>
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
        </NoLayout>
    );
};

export default MessageCenter;
