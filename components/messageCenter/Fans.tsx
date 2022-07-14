import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import {} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { FollowUserProps, SearchPageMeta } from "../../types/extraApi";
import { timeFormat } from "../../utils/timeTool";
import { ButtonTheme } from "../baseComponents/ButtonTheme";

interface FansProps {}

const Fans: NextPage<FansProps> = (props) => {
    const [lists, setLists] = useState<API.MessageCenterFollowResponse>({
        data: [{ id: 1 }],
        pagemeta: { page: 1, limit: 20, total: 0, total_page: 1 },
    });
    const [showCancel, setShowCancel] = useState<boolean>(false);

    const fetchLists = useMemoizedFn(() => {
        NetWorkApi<SearchPageMeta, API.MessageCenterFollowResponse>({
            method: "get",
            url: "/api/message/center/follow",
            params: {
                Page: 1,
                Limit: 20,
                Order: "desc",
            },
            userToken: true,
        })
            .then((res) => {
                console.log(res);
                setLists({ data: res.data || [], pagemeta: res.pagemeta });
            })
            .catch((err) => {});
    });

    useEffect(() => {
        fetchLists();
    }, []);

    const followUser = useMemoizedFn((item: API.MessageCenterFollow) => {
        NetWorkApi<FollowUserProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/follow",
            params: {
                follow_user_id: item.action_user_id,
                operation: true ? "remove" : "add",
            },
            userToken: true,
        })
            .then((res) => {
                setLists({
                    data: lists.data.map((item) => {
                        if (item.action_user_id === item.action_user_id) {
                            item.action_head_img = "";
                        }
                        return item;
                    }),
                    pagemeta: lists.pagemeta,
                });
            })
            .catch((err) => {});
    });

    return (
        <div className="fans-wrapper">
            <div className="fans-hint">
                共 {lists.pagemeta.total} 条粉丝信息
            </div>
            {lists.data.map((item, index) => {
                return (
                    <div key={index} className="fans-opt-wrapper">
                        <div className="fans-opt-body">
                            <div className="fans-user">
                                <div className="fans-user-img">
                                    <img
                                        src={item.action_head_img}
                                        className="img-style"
                                    />
                                </div>
                                <div className="fans-user-info">
                                    <div className="info-name">
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

                            <div className="fans-operate">
                                {false ? (
                                    <ButtonTheme
                                        className="fans-operate-btn"
                                        isInfo={!showCancel}
                                        isDanger={showCancel}
                                        onMouseEnter={() => setShowCancel(true)}
                                        onMouseLeave={() =>
                                            setShowCancel(false)
                                        }
                                        onClick={() => followUser(item)}
                                    >
                                        {showCancel ? "取消关注" : "已关注"}
                                    </ButtonTheme>
                                ) : (
                                    <ButtonTheme
                                        className="fans-operate-btn"
                                        onClick={() => followUser(item)}
                                    >
                                        <PlusOutlined />
                                        关注
                                    </ButtonTheme>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Fans;
