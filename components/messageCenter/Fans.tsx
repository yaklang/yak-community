import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { Button, Divider, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { UserInfoProps } from "../../types/user";
import { MutualAttentionIcon } from "../../public/icons";

interface FansProps {}

const Fans: NextPage<FansProps> = (props) => {
    const [list, setList] = useState<any[]>([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);

    return (
        <div className="fans-wrapper">
            <div className="fans-hint">共 58 条粉丝信息，其中 0 条未读</div>
            {list.map((item, index) => {
                return (
                    <div key={index} className="fans-opt-wrapper">
                        <div className="fans-opt-body">
                            <div className="fans-user">
                                <div className="fans-user-img">
                                    <img
                                        src="/images/user/github.png"
                                        className="img-style"
                                    />
                                </div>
                                <div className="fans-user-info">
                                    <div className="info-name">Valal</div>
                                    <div className="info-text">关注了我</div>
                                    <div className="info-time">
                                        2022/04/06 12:30
                                    </div>
                                </div>
                            </div>

                            <div className="fans-operate">
                                <Button
                                    className={`fans-operate-btn ${
                                        index % 2 ? "theme-btn" : "active-btn"
                                    }`}
                                >
                                    {index % 2 ? (
                                        <>
                                            <PlusOutlined />
                                            关注
                                        </>
                                    ) : (
                                        "已关注"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Fans;
