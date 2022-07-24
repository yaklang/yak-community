import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { CaretRightOutlined } from "@ant-design/icons";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { SearchPageMeta } from "../../types/extraApi";
import { timeFormat } from "../../utils/timeTool";
import { useRouter } from "next/router";

interface MessageLikeProps {}

const MessageLike: NextPage<MessageLikeProps> = (props) => {
    const [lists, setLists] = useState<API.MessageCenterStarsResponse>({
        data: [],
        pagemeta: { page: 1, limit: 20, total: 0, total_page: 1 },
    });

    const fetchLists = useMemoizedFn(() => {
        NetWorkApi<SearchPageMeta, API.MessageCenterStarsResponse>({
            method: "get",
            url: "/api/message/center/stars",
            params: {
                page: 1,
                limit: 10,
                order: "desc",
            },
            userToken: true,
        })
            .then((res) => {
                setLists({
                    data: lists.data.concat(res.data || []),
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {});
    });

    useEffect(() => {
        fetchLists();
    }, []);

    return (
        <div className="message-like-wrapper">
            <div className="message-like-hint">
                共 {lists.pagemeta.total} 条点赞信息
            </div>
            {lists.data.map((item, index) => {
                return (
                    <LikeMessage
                        key={`${item.action_user_id}-${item.dynamic_id}`}
                        info={item}
                    />
                );
            })}
        </div>
    );
};

export default MessageLike;

// 点赞组件
interface LikeMessageProp {
    info: API.MessageCenterStars;
}
const LikeMessage: React.FC<LikeMessageProp> = (props) => {
    const { info } = props;
    const imgs: string[] =
        !info.dynamic_content_img || info.dynamic_content_img === "null"
            ? []
            : JSON.parse(info.dynamic_content_img);

    const router = useRouter();

    return (
        <div className="like-message-wrapper">
            <div className="like-message-body">
                <div className="body-img">
                    <img
                        src={info.action_head_img}
                        className="img-style"
                        onClick={() =>
                            router.push(`/userpage?user=${info.action_user_id}`)
                        }
                    />
                </div>

                <div className="body-content">
                    <div
                        className="content-name text-ellipsis-style"
                        onClick={() =>
                            router.push(`/userpage?user=${info.action_user_id}`)
                        }
                    >
                        {info.action_user_name}
                    </div>
                    <div className="content-text">赞了这条动态</div>
                    <div className="content-time">
                        {timeFormat(info.created_at, "YYYY/MM/DD HH:mm")}
                    </div>

                    {imgs.length === 0 && !info.dynamic_cover && (
                        <div className="dynamic-wrapper">
                            <div className="dynamic-name text-ellipsis-style">
                                {`@${info.dynamic_user_name}`}
                            </div>

                            <div className="dynamic-content">
                                {info.dynamic_content}
                            </div>
                        </div>
                    )}

                    {imgs.length > 0 && (
                        <div className="dynamic-img-wrapper">
                            <div className="dynamic-img">
                                <img src={imgs[0]} className="img-style" />
                            </div>
                            <div className="dynamic-content">
                                <div className="dynamic-name text-ellipsis-style">
                                    {`@${info.dynamic_user_name}`}
                                </div>

                                <div className="dynamic-text">
                                    {info.dynamic_content}
                                </div>
                            </div>
                        </div>
                    )}

                    {info.dynamic_cover && (
                        <div className="dynamic-video-wrapper">
                            <div className="dynamic-video">
                                <img
                                    src={info.dynamic_cover}
                                    className="img-style"
                                />
                                <div className="video-mask">
                                    <CaretRightOutlined className="icon-style" />
                                </div>
                            </div>
                            <div className="dynamic-content">
                                <div className="dynamic-name text-ellipsis-style">
                                    {`@${info.dynamic_user_name}`}
                                </div>

                                <div className="video-title text-ellipsis-style">
                                    {info.dynamic_title}
                                </div>

                                <div className="dynamic-text text-ellipsis-style">
                                    {info.dynamic_content}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
