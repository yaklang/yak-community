import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { CaretRightOutlined } from "@ant-design/icons";
import { useGetState, useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { SearchPageMeta } from "../../types/extraApi";
import { timeFormat } from "../../utils/timeTool";
import { useRouter } from "next/router";
import { ImgShow } from "../baseComponents/ImgShow";

interface MessageHintProps {}

const MessageHint: NextPage<MessageHintProps> = (props) => {
    const [listPage, setListPage] = useState<number>(1);
    const [loading, setLoading, getLoading] = useGetState<boolean>(false);
    const [lists, setLists] = useState<API.MessageCenterStarsResponse>({
        data: [],
        pagemeta: { page: 1, limit: 10, total: 0, total_page: 1 },
    });

    const fetchLists = useMemoizedFn((page?: number) => {
        if (getLoading()) return;

        setLoading(true);
        NetWorkApi<SearchPageMeta, API.MessageCenterStarsResponse>({
            method: "get",
            url: "/api/message/center/message",
            params: {
                page: page || listPage,
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
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 100));
    });

    useEffect(() => {
        fetchLists();
    }, []);

    const nextPage = useMemoizedFn((e: Event) => {
        if (getLoading()) return;
        if (lists.data.length === lists.pagemeta.total) return;

        if (e && e.target && (e.target as any).scrollingElement) {
            const scroll = (e.target as any).scrollingElement as HTMLElement;
            if (
                scroll.scrollTop + scroll.clientHeight >=
                scroll.scrollHeight - 100
            ) {
                const pages = listPage;
                setListPage(pages + 1);
                fetchLists(pages + 1);
            }
        }
    });
    useEffect(() => {
        document.addEventListener("scroll", nextPage);
        return () => {
            window.removeEventListener("scroll", nextPage);
        };
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
            {loading && <div className="list-loading">正在加载中。。。</div>}
        </div>
    );
};

export default MessageHint;

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
        <div className="hint-message-wrapper">
            <div className="hint-message-body">
                <div className="body-img">
                    <ImgShow
                        src={info.action_head_img}
                        onclick={() =>
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
                    <div className="content-text">
                        该条动态已被管理员删除。原因：所发布内容不合规或含有广告或垃圾信息。为维护网站良好氛围，请遵守《Yak平台使用原则》，谢谢你的理解与支持。
                    </div>
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
                                <ImgShow src={imgs[0]} />
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
                                <ImgShow
                                    isCover={true}
                                    src={info.dynamic_cover}
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
