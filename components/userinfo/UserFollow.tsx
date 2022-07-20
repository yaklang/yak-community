import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Tooltip } from "antd";
import { MutualAttentionIcon } from "../../public/icons";
import { API } from "../../types/api";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { FetchFollowList, FollowUserProps } from "../../types/extraApi";

interface UserFollowProps {
    userId: number;
    onlyShow?: boolean;
    onUpdateUserInfo: () => any;
}

const UserFollow: NextPage<UserFollowProps> = (props) => {
    const { userId, onlyShow = false, onUpdateUserInfo } = props;

    const router = useRouter();

    const [list, setList] = useState<API.UserFollowResponse>({
        data: [],
        pagemeta: { page: 1, limit: 50, total: 0, total_page: 1 },
    });

    const fetchList = useMemoizedFn(() => {
        NetWorkApi<FetchFollowList, API.UserFollowResponse>({
            method: "get",
            url: "/api/user/follow",
            params: { page: 1, limit: 10, order: "desc", user_id: userId },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data: res.data || [],
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {});
    });

    const cancelFollow = useMemoizedFn((id: number) => {
        NetWorkApi<FollowUserProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/follow",
            params: { follow_user_id: id, operation: "remove" },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data: list.data.filter(
                        (item) => item.follow_user_id !== id
                    ),
                    pagemeta: list.pagemeta,
                });
                onUpdateUserInfo();
            })
            .catch((err) => {});
    });

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className="user-follow-wrapper">
            {!onlyShow && (
                <div className="user-follow-hint">
                    {list.pagemeta.total === 0
                        ? `你一共关注了 0 位小伙伴`
                        : `你一共关注了 ${list.pagemeta.total} 位小伙伴，其中 15 位与你互相关注`}
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
                                    <img
                                        src={item.follow_head_img}
                                        className="img-style"
                                        onClick={() =>
                                            router.push(
                                                `/userpage?user=${item.follow_user_id}`
                                            )
                                        }
                                    />
                                </div>
                                <div className="follow-user-info">
                                    <div
                                        className="info-name"
                                        onClick={() =>
                                            router.push(
                                                `/userpage?user=${item.follow_user_id}`
                                            )
                                        }
                                    >
                                        {item.follow_user_name}
                                    </div>
                                    <div className="info-dynamic">
                                        {item.content ? (
                                            <>
                                                <span>{item.content}</span>
                                                {!!imgs &&
                                                    imgs.map((imgItem) => {
                                                        return (
                                                            <a
                                                                key={imgItem}
                                                                href={imgItem}
                                                                target="_blank"
                                                            >{`[图片]`}</a>
                                                        );
                                                    })}
                                                {!!videos && (
                                                    <a
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

                            <div className="follow-operate">
                                {!onlyShow ? (
                                    <>
                                        {item.me_follow && (
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
                                        <div
                                            className="follow-operate-btn"
                                            onClick={() =>
                                                cancelFollow(
                                                    item.follow_user_id
                                                )
                                            }
                                        >
                                            取消关注
                                        </div>
                                    </>
                                ) : (
                                    <>
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
                                        <div
                                            className="follow-operate-btn"
                                            onClick={() =>
                                                cancelFollow(
                                                    item.follow_user_id
                                                )
                                            }
                                        >
                                            取消关注
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserFollow;
