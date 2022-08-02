import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { useGetState, useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { SearchPageMeta } from "../../types/extraApi";
import { timeFormat } from "../../utils/timeTool";
import { useRouter } from "next/router";
import MessageDynamicInfo from "./MessageDynamicInfo";
import { ImgShow } from "../baseComponents/ImgShow";
import { useStore } from "../../store";

interface MessageLikeProps {}

const MessageLike: NextPage<MessageLikeProps> = (props) => {
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
            url: "/api/message/center/stars",
            params: {
                page: page || listPage,
                limit: 10,
                order: "desc",
            },
            userToken: true,
        })
            .then((res) => {
                setLists({
                    data:
                        page === 1
                            ? res.data || []
                            : lists.data.concat(res.data || []),
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 100));
    });

    useEffect(() => {
        fetchLists(1);
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
            {loading && <div className="list-loading">正在加载中...</div>}
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
    const router = useRouter();
    const { userInfo } = useStore();

    const visitUserInfo = useMemoizedFn((id: number) => {
        if (userInfo.user_id === id) {
            router.push({
                pathname: "/userinfo",
                query: { tabs: "dynamic" },
            });
        } else {
            router.push({
                pathname: "/userpage",
                query: { user: id },
            });
        }
    });

    return (
        <div className="like-message-wrapper">
            <div className="like-message-body">
                <div className="body-img">
                    <ImgShow
                        src={info.action_head_img}
                        onclick={() => visitUserInfo(info.action_user_id)}
                    />
                </div>

                <div className="body-content">
                    <div
                        className="content-name text-ellipsis-style"
                        onClick={() => visitUserInfo(info.action_user_id)}
                    >
                        {info.action_user_name}
                    </div>
                    <div className="content-text">赞了这条动态</div>
                    <div className="content-time">
                        {timeFormat(info.created_at, "YYYY/MM/DD HH:mm")}
                    </div>

                    <MessageDynamicInfo info={info} />
                </div>
            </div>
        </div>
    );
};
