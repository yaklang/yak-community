import React, { useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { PlusOutlined } from "@ant-design/icons";
import { API } from "../../types/api";
import { FollowUserProps } from "../../types/extraApi";
import { NetWorkApi } from "../../utils/fetch";
import { ButtonTheme } from "../baseComponents/ButtonTheme";
import { useMemoizedFn } from "ahooks";

interface AvatarCardProps {
    info: API.UserHead;
    isFollow: boolean;
    updateInfo?: () => any;
}

const AvatarCard: NextPage<AvatarCardProps> = (props) => {
    const { info, isFollow, updateInfo } = props;

    const router = useRouter();

    const [showCancel, setShowCancel] = useState<boolean>(false);

    const followUser = useMemoizedFn(() => {
        NetWorkApi<FollowUserProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/follow",
            params: {
                follow_user_id: info.user_id,
                operation: isFollow ? "remove" : "add",
            },
            userToken: true,
        })
            .then((res) => {
                if (updateInfo) updateInfo();
            })
            .catch((err) => {});
    });

    return (
        <div className="avatar-card-wrapper">
            <div className="avatar-card-body">
                <div className="avatar-card-info">
                    <div className="info-img">
                        <img className="img-style" src={info.head_img} />
                    </div>
                    <div className="info-name">{info.user_name}</div>
                    <div className="info-popularity">
                        <div className="info-popularity-block">
                            粉丝<span className="block-count">{info.fans}</span>
                        </div>
                        <div className="info-popularity-block">
                            关注
                            <span className="block-count">
                                {info.follow_num}
                            </span>
                        </div>
                    </div>
                    <div className="info-follow">
                        {isFollow ? (
                            <ButtonTheme
                                className="info-follow-btn"
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
                                onClick={followUser}
                            >
                                <PlusOutlined />
                                关注
                            </ButtonTheme>
                        )}
                    </div>
                </div>

                <div
                    className="avatar-card-operate"
                    onClick={() =>
                        router.push(`/userpage?user=${info.user_id}`)
                    }
                >{`查看个人主页 >`}</div>
            </div>
        </div>
    );
};

export default AvatarCard;
