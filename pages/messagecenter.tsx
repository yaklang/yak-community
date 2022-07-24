import React, { useEffect, useLayoutEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Tabs } from "antd";
import NoLayout from "../components/layout/NoLayout";
import Fans from "../components/messageCenter/Fans";
import MessageLike from "../components/messageCenter/MessageLike";
import MessageComment from "../components/messageCenter/MessageComment";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../utils/fetch";
import { API } from "../types/api";

const { TabPane } = Tabs;

interface MessageCenterProps {}

const MessageCenter: NextPage<MessageCenterProps> = (props) => {
    const router = useRouter();

    const [activeKey, setActiveKey] = useState<string>("like");

    const [messageNum, setMessageNum] = useState<API.MessageCenter>({
        comment_num: 0,
        fans: 0,
        stars_num: 0,
    });

    const fetchUnreadMessage = useMemoizedFn(() => {
        NetWorkApi<{ total: boolean }, API.MessageCenter>({
            method: "get",
            url: "/api/message/center",
            params: { total: true },
            userToken: true,
        })
            .then((res) => setMessageNum(res))
            .catch((err) => {});
    });
    useEffect(() => {
        fetchUnreadMessage();
    }, []);

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
                                        right: `${
                                            (0 -
                                                4 -
                                                (`${messageNum.stars_num}`
                                                    .length > 4
                                                    ? 4
                                                    : `${messageNum.stars_num}`
                                                          .length) *
                                                    8) /
                                            16
                                        }rem`,
                                    }}
                                >
                                    {`${
                                        messageNum.stars_num > 999
                                            ? "999+"
                                            : messageNum.stars_num
                                    }`}
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
                                        right: `${
                                            (0 -
                                                4 -
                                                (`${messageNum.comment_num}`
                                                    .length > 4
                                                    ? 4
                                                    : `${messageNum.comment_num}`
                                                          .length) *
                                                    8) /
                                            16
                                        }rem`,
                                    }}
                                >
                                    {`${
                                        messageNum.comment_num > 999
                                            ? "999+"
                                            : messageNum.comment_num
                                    }`}
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
                                        right: `${
                                            (0 -
                                                4 -
                                                (`${messageNum.fans}`.length > 4
                                                    ? 4
                                                    : `${messageNum.fans}`
                                                          .length) *
                                                    8) /
                                            16
                                        }rem`,
                                    }}
                                >
                                    {`${
                                        messageNum.fans > 999
                                            ? "999+"
                                            : messageNum.fans
                                    }`}
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
