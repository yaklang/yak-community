import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { API } from "../../types/api";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { FetchDynamicInfo, FetchDynamicList } from "../../types/extraApi";
import CommentItem from "../CommentItem";
import PostDynamic from "../modal/PostDynamic";
import { useStore } from "../../store";
import { userInfo } from "os";

interface UserDynamicProps {
    userId: number;
    onUpdateUserInfo: () => any;
    onlyShow?: boolean;
}

const UserDynamic: NextPage<UserDynamicProps> = (props) => {
    const { userId, onlyShow = false, onUpdateUserInfo } = props;
    const { userInfo, homePageDynamicId, setHomePageDynamicId } = useStore();

    const [list, setList] = useState<API.DynamicListResponse>({
        data: [],
        pagemeta: { page: 1, limit: 10, total: 0, total_page: 1 },
    });

    useEffect(() => {
        if (homePageDynamicId) {
            NetWorkApi<FetchDynamicInfo, API.DynamicListDetailResponse>({
                method: "get",
                url: "/api/dynamic/detail",
                params: { id: homePageDynamicId },
                userToken: true,
            })
                .then((res) => {
                    setList({
                        data: [res.data].concat(list.data),
                        pagemeta: list.pagemeta,
                    });
                    setHomePageDynamicId(0);
                })
                .catch((err) => {});
        }
    }, [homePageDynamicId]);

    const fetchList = useMemoizedFn(() => {
        NetWorkApi<FetchDynamicList, API.DynamicListResponse>({
            method: "get",
            url: "/api/dynamic/issue",
            params: { page: 1, limit: 10, order: "desc", user_id: userId },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data: list.data.concat(res.data || []),
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {});
    });
    const fetchUnloggedList = useMemoizedFn(() => {
        NetWorkApi<FetchDynamicList, API.DynamicListResponse>({
            method: "get",
            url: "/api/dynamic/issue/unlogged",
            params: { page: 1, limit: 10, order: "desc", user_id: userId },
        })
            .then((res) => {
                setList({
                    data: list.data.concat(res.data || []),
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {});
    });

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
            </div>

            <PostDynamic
                existId={dynamicId}
                visible={postDynamic}
                onCancel={(flag) => {
                    if (flag) updateDynamicOptInfo(dynamicId);

                    setDynamicId(0);
                    setPostDynamic(false);
                }}
            />
        </div>
    );
};

export default UserDynamic;
