import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { Button, Divider, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { UserInfoProps } from "../../types/user";
import { MutualAttentionIcon } from "../../public/icons";

interface UserFollowProps {
    info: UserInfoProps;
}

const UserFollow: NextPage<UserFollowProps> = (props) => {
    const { info } = props;
    const [list, setList] = useState<any[]>([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);

    return (
        <div className="user-follow-wrapper">
            <div className="user-follow-hint">
                你一共关注了 24 位小伙伴，其中 15 位与你互相关注
            </div>
            {list.map((item, index) => {
                return (
                    <div key={index} className="user-follow-opt-wrapper">
                        <div className="user-follow-opt-body">
                            <div className="follow-user">
                                <div className="follow-user-img">
                                    <img
                                        src="/images/user/github.png"
                                        className="img-style"
                                    />
                                </div>
                                <div className="follow-user-info">
                                    <div className="info-name">{item}</div>
                                    <div className="info-dynamic">
                                        {item % 2 ? (
                                            item
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
                                <div className="follow-operate-btn">
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
