import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { PlusOutlined } from "@ant-design/icons";
import { useGetState, useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { FetchFanList, FollowUserProps } from "../../types/extraApi";
import { timeFormat } from "../../utils/timeTool";
import { ButtonTheme } from "../baseComponents/ButtonTheme";
import { useStore } from "../../store";
import { useRouter } from "next/router";
import { Tooltip } from "antd";
import { MutualAttentionIcon } from "../../public/icons";
import { failed } from "../../utils/notification";
import { getToken } from "../../utils/auth";

interface FansProps {
    userId?: number;
    onlyShow?: boolean;
}

const Fans: NextPage<FansProps> = (props) => {
    const { userId, onlyShow = false } = props;
    const { userInfo } = useStore();
    const router = useRouter();

    const [listPage, setListPage] = useState<number>(1);
    const [loading, setLoading, getLoading] = useGetState<boolean>(false);
    const [lists, setLists] = useState<API.MessageCenterFansResponse>({
        data: [],
        pagemeta: { page: 1, limit: 20, total: 0, total_page: 1 },
    });
    const [showCancel, setShowCancel] = useState<number>(0);

    const fetchLists = useMemoizedFn((page?: number) => {
        if (getLoading()) return;

        setLoading(true);
        NetWorkApi<FetchFanList, API.MessageCenterFansResponse>({
            method: "get",
            url: "/api/message/center/fans",
            params: {
                page: page || listPage,
                limit: 20,
                order: "desc",
                user_id: userInfo.user_id || userId || 0,
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
    const fetchNoLists = useMemoizedFn((page?: number) => {
        if (getLoading()) return;

        setLoading(true);
        NetWorkApi<FetchFanList, API.MessageCenterFansResponse>({
            method: "get",
            url: "/api/message/center/fans/unlogged",
            params: {
                page: page || listPage,
                limit: 20,
                order: "desc",
                user_id: userInfo.user_id || userId || 0,
            },
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
        if (userInfo.isLogin) fetchLists(1);
        else fetchNoLists(1);
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
                const isToken = !!getToken();
                const pages = listPage;
                setListPage(pages + 1);
                if (isToken) fetchLists(pages + 1);
                else fetchNoLists(pages + 1);
            }
        }
    });
    useEffect(() => {
        document.addEventListener("scroll", nextPage);
        return () => {
            window.removeEventListener("scroll", nextPage);
        };
    }, []);

    const [followLoading, setFollowLoading, getFollowLoading] =
        useGetState<boolean>(false);
    const followUser = useMemoizedFn((info: API.MessageCenterFans) => {
        if (!userInfo.isLogin) {
            failed("请登录后重新操作");
            return false;
        }
        if (getFollowLoading()) return;

        setFollowLoading(true);
        NetWorkApi<FollowUserProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/follow",
            params: {
                follow_user_id: info.action_user_id,
                operation: info.me_follow ? "remove" : "add",
            },
            userToken: true,
        })
            .then((res) => {
                setLists({
                    data: lists.data.map((item) => {
                        if (item.action_user_id === info.action_user_id) {
                            item.me_follow = !item.me_follow;
                        }
                        return item;
                    }),
                    pagemeta: lists.pagemeta,
                });
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setFollowLoading(false), 100));
    });

    return (
        <div className="fans-wrapper">
            {!onlyShow && (
                <div className="fans-hint">
                    共 {lists.pagemeta.total} 条粉丝信息
                </div>
            )}
            {lists.data.map((item, index) => {
                return (
                    <div key={item.action_user_id} className="fans-opt-wrapper">
                        <div className="fans-opt-body">
                            <div className="fans-user">
                                <div className="fans-user-img">
                                    <img
                                        src={item.action_head_img}
                                        className="img-style"
                                        onClick={() =>
                                            router.push(
                                                `/userpage?user=${item.action_user_id}`
                                            )
                                        }
                                    />
                                </div>
                                <div className="fans-user-info">
                                    <div
                                        className="info-name"
                                        onClick={() =>
                                            router.push(
                                                `/userpage?user=${item.action_user_id}`
                                            )
                                        }
                                    >
                                        {item.action_user_name}
                                    </div>
                                    <div className="info-text">关注了我</div>
                                    <div className="info-time">
                                        {timeFormat(
                                            item.created_at,
                                            "YYYY/MM/DD HH:mm"
                                        )}
                                    </div>
                                </div>
                            </div>

                            {userInfo.user_id !== item.action_user_id && (
                                <div className="fans-operate">
                                    {onlyShow &&
                                        item.me_follow &&
                                        item.follow_me && (
                                            <Tooltip
                                                placement="bottom"
                                                title={
                                                    <span className="mutual-attention-hint-style">
                                                        互相关注
                                                    </span>
                                                }
                                            >
                                                <MutualAttentionIcon className="fans-operate-icon" />
                                            </Tooltip>
                                        )}
                                    {item.me_follow ? (
                                        <ButtonTheme
                                            className="fans-operate-btn"
                                            disabled={followLoading}
                                            isInfo={!showCancel}
                                            isDanger={!!showCancel}
                                            onMouseEnter={() =>
                                                setShowCancel(
                                                    item.action_user_id
                                                )
                                            }
                                            onMouseLeave={() =>
                                                setShowCancel(0)
                                            }
                                            onClick={() => followUser(item)}
                                        >
                                            {showCancel === item.action_user_id
                                                ? "取消关注"
                                                : "已关注"}
                                        </ButtonTheme>
                                    ) : (
                                        <ButtonTheme
                                            className="fans-operate-btn"
                                            disabled={followLoading}
                                            onClick={() => followUser(item)}
                                        >
                                            <PlusOutlined />
                                            关注
                                        </ButtonTheme>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            {loading && <div className="list-loading">正在加载中。。。</div>}
        </div>
    );
};

export default Fans;
