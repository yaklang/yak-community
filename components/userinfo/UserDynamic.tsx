import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { Button, Divider, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { MutualAttentionIcon } from "../../public/icons";
import { API } from "../../types/api";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import {
    FetchDynamicList,
    FollowUserProps,
    SearchPageMeta,
} from "../../types/extraApi";
import CommentItem from "../CommentItem";

interface UserDynamicProps {
    info: API.UserDetail;
    onUpdateUserInfo: () => any;
}

const UserDynamic: NextPage<UserDynamicProps> = (props) => {
    const { info, onUpdateUserInfo } = props;

    const [list, setList] = useState<API.DynamicListResponse>({
        data: [
            {
                id: 1,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                user_id: 1,
                user_name: "123",
                head_img: "",
                content: "123",
                content_img: "",
                content_video: "",
                topic_id: 123,
                topics: "",
                title: "",
                cover: "",
                download: false,
                stars: 123,
                collect: 123,
                is_stars: false,
                is_collect: false,
                is_follow: false,
                comment_num: 123,
            },
        ],
        pagemeta: { page: 1, limit: 50, total: 0, total_page: 0 },
    });

    const fetchList = useMemoizedFn(() => {
        NetWorkApi<FetchDynamicList, API.DynamicListResponse>({
            method: "get",
            url: "/api/dynamic/issue",
            params: { Page: 1, Limit: 10, Order: "desc", user_id: info.id },
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
            if (type === "stars" || type === "collect") {
                setList({
                    data: list.data.map((item) => {
                        if (item.id === info.id) return info;
                        return item;
                    }),
                    pagemeta: list.pagemeta,
                });
            }
            if (type === "user") return;
        }
    );

    const delDynamic = useMemoizedFn((info: API.DynamicLists) => {
        NetWorkApi<{ id: number }, API.DynamicListResponse>({
            method: "delete",
            url: "/api/dynamic/issue",
            params: { id: info.id },
            userToken: true,
        })
            .then((res) => {
                console.log(res);
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
            <div className="user-dynamic-hint">
                {`共 ${list.pagemeta.total || 0} 条动态`}
            </div>

            <div className="user-dynamic-body">
                {list.data.map((item, index) => {
                    return (
                        <CommentItem
                            key={item.id}
                            info={item}
                            updateInfo={updateDynamicInfo}
                            isOwner={true}
                            onEdit={() => {}}
                            onDel={() => {
                                delDynamic(item);
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default UserDynamic;
