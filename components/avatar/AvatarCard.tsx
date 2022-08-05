import React, { useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { PlusOutlined } from "@ant-design/icons";
import { API } from "../../types/api";
import { FollowUserProps } from "../../types/extraApi";
import { NetWorkApi } from "../../utils/fetch";
import { ButtonTheme } from "../baseComponents/ButtonTheme";
import { useGetState, useMemoizedFn } from "ahooks";
import { useStore } from "../../store";
import { failed } from "../../utils/notification";
import { ImgShow } from "../baseComponents/ImgShow";

interface AvatarCardProps {
    info: API.UserHead;
    updateInfo?: () => any;
}

const AvatarCard: NextPage<AvatarCardProps> = (props) => {
    const { info, updateInfo } = props;
    const { userInfo } = useStore();
    const router = useRouter();

    const [loading, setLoading, getLoading] = useGetState<boolean>(false);
    const [showCancel, setShowCancel] = useState<boolean>(false);

    const followUser = useMemoizedFn(() => {
        if (!userInfo.isLogin) {
            failed("请登录后重新操作");
            return false;
        }
        if (getLoading()) return;

        setLoading(true);
        NetWorkApi<FollowUserProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/follow",
            params: {
                follow_user_id: info.user_id,
                operation: info.is_follow ? "remove" : "add",
            },
            userToken: true,
        })
            .then((res) => {
                if (updateInfo) updateInfo();
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 300));
    });

    const visitUserInfo = useMemoizedFn(() => {
        if (userInfo.user_id === info.user_id) {
            router.push({
                pathname: "/userinfo",
                query: { tabs: "dynamic" },
            });
        } else {
            router.push({
                pathname: "/userpage",
                query: { user: info.user_id },
            });
        }
    });

    const visitFollows = useMemoizedFn(() => {
        if (userInfo.user_id === info.user_id) {
            router.push({
                pathname: "/userinfo",
                query: { tabs: "follow" },
            });
        } else {
            router.push({
                pathname: "/userpage",
                query: { user: info.user_id, tabs: "follow" },
            });
        }
    });
    const visitFans = useMemoizedFn(() => {
        if (userInfo.user_id === info.user_id) {
            router.push({
                pathname: "/messagecenter",
                query: { tabs: "fans" },
            });
        } else {
            router.push({
                pathname: "/userpage",
                query: { user: info.user_id, tabs: "fans" },
            });
        }
    });

    return (
        <div className="avatar-card-wrapper">
            <div className="avatar-card-body">
                <div className="avatar-card-info">
                    <div className="info-img">
                        <ImgShow src={info.head_img} onclick={visitUserInfo} />
                    </div>
                    <div className="info-name" onClick={visitUserInfo}>
                        {info.user_name}
                    </div>
                    <div className="info-popularity">
                        <div
                            className="info-popularity-block"
                            onClick={visitFans}
                        >
                            粉丝<span className="block-count">{info.fans}</span>
                        </div>
                        <div
                            className="info-popularity-block"
                            onClick={visitFollows}
                        >
                            关注
                            <span className="block-count">
                                {info.follow_num}
                            </span>
                        </div>
                    </div>
                    {userInfo.user_id !== info.user_id && (
                        <div className="info-follow">
                            {info.is_follow ? (
                                <ButtonTheme
                                    className="info-follow-btn"
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
                                    className="info-follow-btn"
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

                <div
                    className="avatar-card-operate"
                    onClick={visitUserInfo}
                >{`查看个人主页 >`}</div>
            </div>
        </div>
    );
};

export default AvatarCard;
