import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { UserInfoProps } from "../../types/user";

interface AvatarProps {
    info: UserInfoProps;
}

const Avatar: NextPage<AvatarProps> = (props) => {
    const { info } = props;

    return (
        <div className="avatar-wrapper">
            <div className="avatar-body">
                <div className="avatar-author-info">
                    <div className="avatar-author-info-header">
                        <img
                            className="img-style"
                            src={`https://t12.baidu.com/it/u=3376231878,176147949&fm=30&app=106&f=JPEG?w=312&h=208&s=AA5210C7024E4555DC8CDCBB03005001`}
                        />
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
                                <span className="quantity-style">{"1234"}</span>
                            </div>
                            <div className="author-popularity-span">
                                关注
                                <span className="quantity-style">{"24"}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="avatar-follow">
                    <Button className="avatar-follow-btn">
                        <PlusOutlined />
                        关注
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Avatar;
