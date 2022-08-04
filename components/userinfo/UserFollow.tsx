import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Tooltip } from "antd";
import { MutualAttentionIcon } from "../../public/icons";
import { API } from "../../types/api";
import { useGetState, useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { FetchFollowList, FollowUserProps } from "../../types/extraApi";
import { useStore } from "../../store";
import { failed } from "../../utils/notification";
import { getToken } from "../../utils/auth";
import { ImgShow } from "../baseComponents/ImgShow";

interface UserFollowProps {
    userId: number;
    onlyShow?: boolean;
    onUpdateUserInfo: () => any;
}

const UserFollow: NextPage<UserFollowProps> = (props) => {
    const { userId, onlyShow = false, onUpdateUserInfo } = props;
    const { userInfo } = useStore();
    const router = useRouter();

    const [listPage, setListPage] = useState<number>(1);
    const [loading, setLoading, getLoading] = useGetState<boolean>(false);
    const [list, setList] = useState<API.UserFollowResponse>({
        data: [],
        pagemeta: { page: 1, limit: 50, total: 0, total_page: 1 },
    });
    const [crossNum, setCrossNum] = useState<number>(0);

    const fetchList = useMemoizedFn((page?: number) => {
        if (getLoading()) return;

        setLoading(true);
        NetWorkApi<FetchFollowList, API.UserFollowResponse>({
            method: "get",
            url: "/api/user/follow",
            params: {
                page: page || listPage,
                limit: 10,
                order: "desc",
                user_id: userId,
            },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data: list.data.concat(res.data || []),
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 50));
    });
    const fetchUnloggedList = useMemoizedFn((page?: number) => {
        if (getLoading()) return;

        setLoading(true);
        NetWorkApi<FetchFollowList, API.UserFollowResponse>({
            method: "get",
            url: "/api/user/follow/unlogged",
            params: {
                page: page || listPage,
                limit: 10,
                order: "desc",
                user_id: userId,
            },
        })
            .then((res) => {
                setList({
                    data: list.data.concat(res.data || []),
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 50));
    });
    const fetchCrossNum = useMemoizedFn(() => {
        NetWorkApi<undefined, number>({
            method: "get",
            url: "/api/cross/follow",
            userToken: true,
        })
            .then((res) => {
                setCrossNum(res);
            })
            .catch((err) => {});
    });

    const nextPage = useMemoizedFn((e: Event) => {
        if (getLoading()) return;
        if (list.data.length === list.pagemeta.total) return;

        if (e && e.target && (e.target as any).scrollingElement) {
            const scroll = (e.target as any).scrollingElement as HTMLElement;
            if (
                scroll.scrollTop + scroll.clientHeight >=
                scroll.scrollHeight - 100
            ) {
                const isToken = !!getToken();
                const pages = listPage;
                setListPage(pages + 1);
                if (isToken) fetchList(pages + 1);
                else fetchUnloggedList(pages + 1);
            }
        }
    });
    useEffect(() => {
        document.addEventListener("scroll", nextPage);
        return () => {
            window.removeEventListener("scroll", nextPage);
        };
    }, []);

    const cancelFollow = useMemoizedFn((id: number, flag?: boolean) => {
        if (!userInfo.isLogin) {
            failed("请登录后重新操作");
            return false;
        }

        NetWorkApi<FollowUserProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/follow",
            params: {
                follow_user_id: id,
                operation: onlyShow ? (flag ? "remove" : "add") : "remove",
            },
            userToken: true,
        })
            .then((res) => {
                if (onlyShow) {
                    setList({
                        data: list.data.map((item) => {
                            if (item.follow_user_id === id) {
                                item.me_follow = !item.me_follow;
                            }
                            return item;
                        }),
                        pagemeta: list.pagemeta,
                    });
                } else {
                    setList({
                        data: list.data.filter(
                            (item) => item.follow_user_id !== id
                        ),
                        pagemeta: list.pagemeta,
                    });
                }

                onUpdateUserInfo();
            })
            .catch((err) => {});
    });

    useEffect(() => {
        const tokenFlag = !!getToken();
        if (tokenFlag) {
            if (userInfo.isLogin) {
                fetchList();
                fetchCrossNum();
            }
        } else {
            fetchUnloggedList();
        }
    }, [userInfo]);

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
        <div className="user-follow-wrapper">
            {!onlyShow && (
                <div className="user-follow-hint">
                    {list.pagemeta.total === 0
                        ? `你一共关注了 0 位小伙伴`
                        : `你一共关注了 ${list.pagemeta.total} 位小伙伴，其中 ${crossNum} 位与你互相关注`}
                </div>
            )}
            {list.data.map((item, index) => {
                const imgs: string[] =
                    !item.content_img || item.content_img === "null"
                        ? undefined
                        : JSON.parse(item.content_img);
                const videos =
                    !item.content_video || item.content_video === "null"
                        ? undefined
                        : item.content_video;

                return (
                    <div
                        key={item.follow_user_id}
                        className="user-follow-opt-wrapper"
                    >
                        <div className="user-follow-opt-body">
                            <div className="follow-user">
                                <div className="follow-user-img">
                                    <ImgShow
                                        src={item.follow_head_img}
                                        onclick={() =>
                                            visitUserInfo(item.follow_user_id)
                                        }
                                    />
                                </div>
                                <div className="follow-user-info">
                                    <div
                                        className="info-name text-ellipsis-style"
                                        onClick={() =>
                                            visitUserInfo(item.follow_user_id)
                                        }
                                    >
                                        {item.follow_user_name}
                                    </div>
                                    <div
                                        className="info-dynamic text-ellipsis-style"
                                        onClick={() => {
                                            if (item.dynamic_id)
                                                router.push(
                                                    `/dynamic?id=${item.dynamic_id}`
                                                );
                                        }}
                                    >
                                        {item.content ? (
                                            <>
                                                <span>{item.content}</span>{" "}
                                                {!!imgs &&
                                                    imgs.map((imgItem) => {
                                                        return (
                                                            <span
                                                                key={imgItem}
                                                            >{`[图片]`}</span>
                                                        );
                                                    })}
                                                {!!videos && (
                                                    <a
                                                        rel="noopener noreferrer"
                                                        href={videos}
                                                        target="_blank"
                                                    >{`[视频]`}</a>
                                                )}
                                            </>
                                        ) : (
                                            <span className="no-dynamic">
                                                暂无动态
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {userInfo.user_id !== item.follow_user_id && (
                                <div className="follow-operate">
                                    {item.me_follow && item.follow_me && (
                                        <Tooltip
                                            placement="bottom"
                                            title={
                                                <span className="mutual-attention-hint-style">
                                                    互相关注
                                                </span>
                                            }
                                        >
                                            <MutualAttentionIcon className="follow-operate-icon" />
                                        </Tooltip>
                                    )}
                                    {onlyShow ? (
                                        <div
                                            className={`follow-operate-btn-${item.me_follow}`}
                                            onClick={() =>
                                                cancelFollow(
                                                    item.follow_user_id,
                                                    item.me_follow
                                                )
                                            }
                                        >
                                            {item.me_follow
                                                ? "取消关注"
                                                : "关注"}
                                        </div>
                                    ) : (
                                        <div
                                            className="follow-operate-btn-true"
                                            onClick={() =>
                                                cancelFollow(
                                                    item.follow_user_id
                                                )
                                            }
                                        >
                                            取消关注
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {loading && <div className="list-loading">正在加载中...</div>}
        </div>
    );
};

export default UserFollow;
