import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { API } from "../../types/api";
import { useGetState, useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { FetchDynamicInfo, SearchPageMeta } from "../../types/extraApi";
import CommentItem from "../CommentItem";

interface UserCollectProps {
    info: API.UserDetail;
    onUpdateUserInfo: () => any;
}

const UserCollect: NextPage<UserCollectProps> = (props) => {
    const { info, onUpdateUserInfo } = props;

    const [listPage, setListPage] = useState<number>(1);
    const [loading, setLoading, getLoading] = useGetState<boolean>(false);
    const [list, setList] = useState<API.DynamicListResponse>({
        data: [],
        pagemeta: { page: 1, limit: 10, total: 0, total_page: 1 },
    });

    const fetchList = useMemoizedFn((page?: number) => {
        if (getLoading()) return;

        setLoading(true);
        NetWorkApi<SearchPageMeta, API.DynamicListResponse>({
            method: "get",
            url: "/api/collect/dynamic",
            params: { page: page || listPage, limit: 10, order: "desc" },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data: list.data.concat(res.data || []),
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 100));
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
                const pages = listPage;
                setListPage(pages + 1);
                fetchList(pages + 1);
            }
        }
    });
    useEffect(() => {
        document.addEventListener("scroll", nextPage);
        return () => {
            window.removeEventListener("scroll", nextPage);
        };
    }, []);

    useEffect(() => {
        fetchList();
    }, []);

    const updateDynamicInfo = useMemoizedFn(
        (type: "user" | "stars" | "collect", info: API.DynamicLists) => {
            if (type === "stars") {
                setList({
                    data: list.data.map((item) => {
                        if (item.id === info.id) return info;
                        return item;
                    }),
                    pagemeta: list.pagemeta,
                });
            }
            if (type === "collect") {
                setList({
                    data: list.data.filter((item) => {
                        return item.id !== info.id;
                    }),
                    pagemeta: list.pagemeta,
                });
                onUpdateUserInfo();
            }
            if (type === "user") {
                setList({
                    data: list.data.map((item) => {
                        if (item.user_id === info.user_id)
                            item.is_follow = !item.is_follow;
                        return item;
                    }),
                    pagemeta: list.pagemeta,
                });
                onUpdateUserInfo();
            }
        }
    );

    // 更新动态局部数据(请求后端获取)
    const updateDynamicInfoApi = useMemoizedFn((id: number) => {
        NetWorkApi<FetchDynamicInfo, API.DynamicListDetailResponse>({
            method: "get",
            url: "/api/dynamic/detail",
            params: { id },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data: list.data.map((item) => {
                        if (item.id === res.data.id) return res.data;
                        return item;
                    }),
                    pagemeta: list.pagemeta,
                });
            })
            .catch((err) => {});
    });

    return (
        <div className="user-collect-wrapper">
            <div className="user-collect-hint">
                {`共 ${list.pagemeta.total || 0} 条收藏`}
            </div>

            <div className="user-collect-body">
                {list.data.map((item, index) => {
                    return (
                        <CommentItem
                            key={item.id}
                            info={item}
                            updateInfo={updateDynamicInfo}
                            updateDynamicInfo={updateDynamicInfoApi}
                        />
                    );
                })}
                {loading && (
                    <div className="list-loading">正在加载中...</div>
                )}
            </div>
        </div>
    );
};

export default UserCollect;
