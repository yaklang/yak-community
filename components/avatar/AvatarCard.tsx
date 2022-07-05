import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { LoginUserInfoProps } from "../../types/user";

interface AvatarCardProps {
    info: LoginUserInfoProps;
}

const AvatarCard: NextPage<AvatarCardProps> = (props) => {
    const { info } = props;

    return (
        <div className="avatar-card-wrapper">
            <div className="avatar-card-body">
                <div className="avatar-card-info">
                    <div className="info-img">
                        <img
                            className="img-style"
                            src={`https://t12.baidu.com/it/u=3376231878,176147949&fm=30&app=106&f=JPEG?w=312&h=208&s=AA5210C7024E4555DC8CDCBB03005001`}
                        />
                    </div>
                    <div className="info-name">TimWhite</div>
                    <div className="info-popularity">
                        <div className="info-popularity-block">
                            粉丝<span className="block-count">3568</span>
                        </div>
                        <div className="info-popularity-block">
                            关注<span className="block-count">24</span>
                        </div>
                    </div>
                    <div className="info-follow">
                        <Button className="info-follow-btn">
                            <PlusOutlined />
                            关注
                        </Button>
                    </div>
                </div>

                <div className="avatar-card-operate">{`查看个人主页 >`}</div>
            </div>
        </div>
    );
};

export default AvatarCard;
