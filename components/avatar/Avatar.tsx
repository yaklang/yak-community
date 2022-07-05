import React from "react";
import { NextPage } from "next";
import { PlusOutlined } from "@ant-design/icons";
import { API } from "../../types/api";
import { ButtonTheme } from "../baseComponents/ButtonTheme";
import { count } from "console";

interface AvatarProps {
    info: API.UserDetail;
    count: API.UserHead;
}

const Avatar: NextPage<AvatarProps> = (props) => {
    const { info, count } = props;

    return (
        <div className="avatar-wrapper">
            <div className="avatar-body">
                <div className="avatar-author-info">
                    <div className="avatar-author-info-header">
                        <img className="img-style" src={info.head_img} />
                    </div>
                    <div className="avatar-author-info-data">
                        <div
                            className="author-name text-ellipsis-style"
                            title={info.name || ""}
                        >
                            {info.name}
                        </div>
                        <div className="author-popularity">
                            <div className="author-popularity-span">
                                粉丝
                                <span className="quantity-style">
                                    {count.fans}
                                </span>
                            </div>
                            <div className="author-popularity-span">
                                关注
                                <span className="quantity-style">
                                    {count.follow_num}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="avatar-follow">
                    <ButtonTheme className="avatar-follow-btn">
                        <PlusOutlined />
                        关注
                    </ButtonTheme>
                </div>
            </div>
        </div>
    );
};

export default Avatar;
