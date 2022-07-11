import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import {} from "antd";
import {} from "@ant-design/icons";
import { API } from "../../types/api";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { SearchPageMeta } from "../../types/extraApi";
import CommentItem from "../CommentItem";

interface UserCollectProps {
    info: API.UserDetail;
    onUpdateUserInfo: () => any;
}

const UserCollect: NextPage<UserCollectProps> = (props) => {
    const { info, onUpdateUserInfo } = props;

    const [list, setList] = useState<API.DynamicListResponse>({
        data: [],
        pagemeta: { page: 1, limit: 50, total: 0, total_page: 0 },
    });

    const fetchList = useMemoizedFn(() => {
        NetWorkApi<SearchPageMeta, API.DynamicListResponse>({
            method: "get",
            url: "/api/collect/dynamic",
            params: { Page: 1, Limit: 10, Order: "desc" },
            userToken: true,
        })
            .then((res) => {
                console.log(res);
                setList({
                    data: res.data || [],
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {});
    });

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
            }
        }
    );

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
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default UserCollect;
