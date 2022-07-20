import React, { useState } from "react";
import { NextPage } from "next";
import { PlusOutlined } from "@ant-design/icons";
import { API } from "../../types/api";
import { ButtonTheme } from "../baseComponents/ButtonTheme";
import { useGetState, useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { FollowUserProps } from "../../types/extraApi";

interface AvatarProps {
    id: number;
    name: string;
    img: string;
    fans: number;
    follows: number;
    isFollow?: boolean;
    showFollow?: boolean;
    updateInfo?: () => any;
}

const Avatar: NextPage<AvatarProps> = (props) => {
    const {
        id,
        name,
        img,
        fans,
        follows,
        isFollow,
        showFollow = false,
        updateInfo,
    } = props;

    const [showCancel, setShowCancel] = useState<boolean>(false);
    const [loading, setLoading, getLoading] = useGetState<boolean>(false);

    const followUser = useMemoizedFn(() => {
        if (getLoading()) return;

        setLoading(true);
        NetWorkApi<FollowUserProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/follow",
            params: {
                follow_user_id: id,
                operation: isFollow ? "remove" : "add",
            },
            userToken: true,
        })
            .then((res) => {
                if (updateInfo) updateInfo();
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 300));
    });

    return (
        <div className="avatar-wrapper">
            <div className="avatar-body">
                <div className="avatar-author-info">
                    <div className="avatar-author-info-header">
                        <img className="img-style" src={img} />
                    </div>
                    <div className="avatar-author-info-data">
                        <div
                            className="author-name text-ellipsis-style"
                            title={name}
                        >
                            {name}
                        </div>
                        <div className="author-popularity">
                            <div className="author-popularity-span">
                                粉丝
                                <span className="quantity-style">{fans}</span>
                            </div>
                            <div className="author-popularity-span">
                                关注
                                <span className="quantity-style">
                                    {follows}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {showFollow && (
                    <div className="avatar-follow">
                        {isFollow ? (
                            <ButtonTheme
                                className="avatar-follow-btn"
                                disabled={loading}
                                isInfo={!showCancel}
                                isDanger={showCancel}
                                onMouseEnter={() => setShowCancel(true)}
                                onMouseLeave={() => setShowCancel(false)}
                                onClick={followUser}
                            >
                                {showCancel ? "取消关注" : "已关注"}
                            </ButtonTheme>
                        ) : (
                            <ButtonTheme
                                className="avatar-follow-btn"
                                disabled={loading}
                                onClick={followUser}
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
};

export default Avatar;
