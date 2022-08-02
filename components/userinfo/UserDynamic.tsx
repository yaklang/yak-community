import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { API } from "../../types/api";
import { useGetState, useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { FetchDynamicInfo, FetchDynamicList } from "../../types/extraApi";
import CommentItem from "../CommentItem";
import PostDynamic from "../modal/PostDynamic";
import { useStore } from "../../store";
import { getToken } from "../../utils/auth";

interface UserDynamicProps {
    userId: number;
    isFollow?: boolean;
    onUpdateUserInfo: () => any;
    onlyShow?: boolean;
}

const UserDynamic: NextPage<UserDynamicProps> = (props) => {
    const { userId, isFollow, onlyShow = false, onUpdateUserInfo } = props;
    const { userInfo, homePageDynamicId, setHomePageDynamicId } = useStore();

    const [listLoading, setListLoading, getListLoading] =
        useGetState<boolean>(false);
    const [pageList, setPageList] = useState<number>(1);
    const [list, setList] = useState<API.DynamicListResponse>({
        data: [],
        pagemeta: { page: 1, limit: 10, total: 0, total_page: 1 },
    });

    useEffect(() => {
        if (userId) {
            setList({
                data: list.data.map((item) => {
                    item.is_follow = !!isFollow;
                    return item;
                }),
                pagemeta: list.pagemeta,
            });
        }
    }, [isFollow]);

    useEffect(() => {
        if (!homePageDynamicId.trigger && !!homePageDynamicId.value) {
            NetWorkApi<FetchDynamicInfo, API.DynamicListDetailResponse>({
                method: "get",
                url: "/api/dynamic/detail",
                params: { id: homePageDynamicId.value },
                userToken: true,
            })
                .then((res) => {
                    setList({
                        data: [res.data].concat(list.data),
                        pagemeta: list.pagemeta,
                    });
                    setHomePageDynamicId({ value: 0, trigger: false });
                })
                .catch((err) => {});
        }
    }, [homePageDynamicId]);

    const fetchList = useMemoizedFn((page?: number) => {
        if (getListLoading()) return;

        setListLoading(true);
        NetWorkApi<FetchDynamicList, API.DynamicListResponse>({
            method: "get",
            url: "/api/dynamic/issue",
            params: {
                page: page || pageList,
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
            .finally(() => setTimeout(() => setListLoading(false), 100));
    });
    const fetchUnloggedList = useMemoizedFn((page?: number) => {
        if (getListLoading()) return;

        setListLoading(true);
        NetWorkApi<FetchDynamicList, API.DynamicListResponse>({
            method: "get",
            url: "/api/dynamic/issue/unlogged",
            params: {
                page: page || pageList,
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
            .finally(() => setTimeout(() => setListLoading(false), 100));
    });

    const nextPage = useMemoizedFn((e: Event) => {
        if (getListLoading()) return;
        if (list.data.length === list.pagemeta.total) return;

        if (e && e.target && (e.target as any).scrollingElement) {
            const scroll = (e.target as any).scrollingElement as HTMLElement;
            if (
                scroll.scrollTop + scroll.clientHeight >=
                scroll.scrollHeight - 100
            ) {
                const isToken = !!getToken();
                const pages = pageList;
                setPageList(pages + 1);
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

    useEffect(() => {
        if (userInfo.isLogin) fetchList();
        else fetchUnloggedList();
    }, []);

    const updateDynamicInfo = useMemoizedFn(
        (type: "user" | "stars" | "collect", info: API.DynamicLists) => {
            if (type === "stars" || type === "collect") {
                setList({
                    data: list.data.map((item) => {
                        if (item.id === info.id) return info;
                        return item;
                    }),
                    pagemeta: list.pagemeta,
                });
            }
            if (type === "user") {
                setList({
                    data: list.data.map((item) => {
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

    const [postDynamic, setPostDynamic] = useState<boolean>(false);
    const [dynamicId, setDynamicId] = useState<number>(0);
    const editDynamic = useMemoizedFn((info: API.DynamicLists) => {
        setDynamicId(info.id);
        setPostDynamic(true);
    });
    const updateDynamicOptInfo = useMemoizedFn((id: number) => {
        NetWorkApi<FetchDynamicInfo, API.DynamicListDetailResponse>({
            method: "get",
            url: "/api/dynamic/detail",
            params: { id },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data: list.data.map((item) => {
                        if (item.id === id) return res.data;
                        return item;
                    }),
                    pagemeta: list.pagemeta,
                });
            })
            .catch((err) => {});
    });

    const delDynamic = useMemoizedFn((info: API.DynamicLists) => {
        NetWorkApi<{ id: number }, API.ActionSucceeded>({
            method: "delete",
            url: "/api/dynamic/issue",
            params: { id: info.id },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data: list.data.filter((item) => item.id !== info.id),
                    pagemeta: list.pagemeta,
                });
                onUpdateUserInfo();
            })
            .catch((err) => {});
    });

    return (
        <div className="user-dynamic-wrapper">
            {!onlyShow && (
                <div className="user-dynamic-hint">
                    {`共 ${list.pagemeta.total || 0} 条动态`}
                </div>
            )}

            <div className="user-dynamic-body">
                {list.data.map((item, index) => {
                    return (
                        <CommentItem
                            key={item.id}
                            info={item}
                            updateInfo={updateDynamicInfo}
                            updateDynamicInfo={updateDynamicInfoApi}
                            isOwner={!onlyShow}
                            onEdit={() => editDynamic(item)}
                            onDel={() => delDynamic(item)}
                        />
                    );
                })}
                {listLoading && (
                    <div className="list-loading">正在加载中...</div>
                )}
            </div>

            {postDynamic && (
                <PostDynamic
                    existId={dynamicId}
                    visible={postDynamic}
                    onCancel={(flag) => {
                        if (flag) updateDynamicOptInfo(dynamicId);

                        setDynamicId(0);
                        setPostDynamic(false);
                    }}
                />
            )}
        </div>
    );
};

export default UserDynamic;
