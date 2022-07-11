import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { Button, Divider, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { MutualAttentionIcon } from "../../public/icons";
import { API } from "../../types/api";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { FollowUserProps, SearchPageMeta } from "../../types/extraApi";

interface UserFollowProps {
    info: API.UserDetail;
    onUpdateUserInfo: () => any;
}

const UserFollow: NextPage<UserFollowProps> = (props) => {
    const { info, onUpdateUserInfo } = props;

    const [list, setList] = useState<API.UserFollowResponse>({
        data: [],
        pagemeta: { page: 1, limit: 50, total: 0, total_page: 0 },
    });

    const fetchList = useMemoizedFn(() => {
        NetWorkApi<SearchPageMeta, API.UserFollowResponse>({
            method: "get",
            url: "/api/user/follow",
            params: { Page: 1, Limit: 50, Order: "desc" },
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

    const cancelFollow = useMemoizedFn(() => {
        NetWorkApi<FollowUserProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/follow",
            params: { follow_user_id: 1, operation: "remove" },
            userToken: true,
        })
            .then((res) => {
                console.log(res);
                fetchList();
                onUpdateUserInfo();
            })
            .catch((err) => {});
    });

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className="user-follow-wrapper">
            <div className="user-follow-hint">
                {list.pagemeta.total === 0
                    ? `你一共关注了 0 位小伙伴`
                    : `你一共关注了 ${list.pagemeta.total} 位小伙伴，其中 15 位与你互相关注`}
            </div>
            {list.data.map((item, index) => {
                return (
                    <div key={index} className="user-follow-opt-wrapper">
                        <div className="user-follow-opt-body">
                            <div className="follow-user">
                                <div className="follow-user-img">
                                    <img
                                        src={item.follow_head_img}
                                        className="img-style"
                                    />
                                </div>
                                <div className="follow-user-info">
                                    <div className="info-name">
                                        {item.follow_user_name}
                                    </div>
                                    <div className="info-dynamic">
                                        {item.content ? (
                                            <span>{item.content}</span>
                                        ) : (
                                            <span className="no-dynamic">
                                                暂无动态
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="follow-operate">
                                {index % 2 ? (
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
                                ) : (
                                    <></>
                                )}
                                <div
                                    className="follow-operate-btn"
                                    onClick={cancelFollow}
                                >
                                    取消关注
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserFollow;
