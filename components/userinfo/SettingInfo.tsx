import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { Button, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { UserInfoProps } from "../../types/user";

interface SettingInfoProps {
    info: UserInfoProps;
}

const SettingInfo: NextPage<SettingInfoProps> = (props) => {
    const { info } = props;

    return (
        <div className="setting-info-wrapper">
            <div className="setting-info-row">
                <div className="info-show">
                    <div className="info-show-img">
                        <img
                            src={`https://t12.baidu.com/it/u=3376231878,176147949&fm=30&app=106&f=JPEG?w=312&h=208&s=AA5210C7024E4555DC8CDCBB03005001`}
                            className="img-style"
                        />
                    </div>
                    <div
                        className="info-show-content text-ellipsis-style"
                        title={info.name || ""}
                    >
                        {info.name}
                    </div>
                </div>
                <div className="info-operate">
                    <div className="info-operate-btn">修改</div>
                </div>
            </div>

            <div className="setting-info-row">
                <div className="info-show">
                    <div className="info-show-img">
                        <img
                            src="/images/user/telephone.png"
                            className="img-style"
                        />
                    </div>
                    <div className="info-show-content text-ellipsis-style">
                        手机号
                    </div>
                </div>
                <div className="info-operate">
                    <div className="info-operate-name">{info.telephone}</div>
                    <div className="info-operate-btn">修改</div>
                </div>
            </div>

            <div className="setting-info-row">
                <div className="info-show">
                    <div className="info-show-img">
                        <img
                            src="/images/user/github.png"
                            className="img-style"
                        />
                    </div>
                    <div className="info-show-content text-ellipsis-style">
                        GitHub
                    </div>
                </div>
                <div className="info-operate">
                    {info.githubName ? (
                        <>
                            <div className="info-operate-name">
                                {info.githubName}
                            </div>
                            {info.wechatName && (
                                <>
                                    <div className="info-operate-unbind">解绑</div>
                                    <div className="info-operate-divider">
                                        <Divider type="vertical" />
                                    </div>
                                </>
                            )}
                            <div className="info-operate-btn">修改</div>
                        </>
                    ) : (
                        <>
                            <div className="info-operate-name">未绑定</div>
                            <div className="info-operate-btn">绑定</div>
                        </>
                    )}
                </div>
            </div>

            <div className="setting-info-row">
                <div className="info-show">
                    <div className="info-show-img">
                        <img
                            src="/images/user/wechat.png"
                            className="img-style"
                        />
                    </div>
                    <div
                        className="info-show-content text-ellipsis-style"
                        title={info.name || ""}
                    >
                        {info.name}
                    </div>
                </div>
                <div className="info-operate">
                    {info.wechatName ? (
                        <>
                            <div className="info-operate-name">
                                {info.wechatName}
                            </div>
                            {info.githubName && (
                                <>
                                    <div className="info-operate-unbind">解绑</div>
                                    <div className="info-operate-divider">
                                        <Divider type="vertical" />
                                    </div>
                                </>
                            )}
                            <div className="info-operate-btn">修改</div>
                        </>
                    ) : (
                        <>
                            <div className="info-operate-name">未绑定</div>
                            <div className="info-operate-btn">绑定</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingInfo;
