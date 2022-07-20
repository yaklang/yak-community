import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import {} from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { SearchPageMeta } from "../../types/extraApi";
import { timeFormat } from "../../utils/timeTool";

interface MessageLikeProps {}

const MessageLike: NextPage<MessageLikeProps> = (props) => {
    const [lists, setLists] = useState<API.MessageCenterStarsResponse>({
        data: [{ id: 1 }],
        pagemeta: { page: 1, limit: 20, total: 0, total_page: 1 },
    });

    const fetchLists = useMemoizedFn(() => {
        NetWorkApi<SearchPageMeta, API.MessageCenterStarsResponse>({
            method: "get",
            url: "/api/message/center/stars",
            params: {
                page: 1,
                limit: 20,
                order: "desc",
            },
            userToken: true,
        })
            .then((res) => {
                console.log(res);
                setLists({ data: res.data || [], pagemeta: res.pagemeta });
            })
            .catch((err) => {});
    });

    useEffect(() => {
        fetchLists();
    }, []);

    return (
        <div className="message-like-wrapper">
            <div className="message-like-hint">
                共 {lists.pagemeta.total} 条点赞信息
            </div>
            {lists.data.map((item, index) => {
                return <LikeMessage key={item.id} info={item} />;
            })}
        </div>
    );
};

export default MessageLike;

// 点赞组件
interface LikeMessageProp {
    info: API.MessageCenterStars;
}
const LikeMessage: React.FC<LikeMessageProp> = (props) => {
    const { info } = props;

    return (
        <div className="like-message-wrapper">
            <div className="like-message-body">
                <div className="body-img">
                    <img src={info.action_head_img} className="img-style" />
                </div>

                <div className="body-content">
                    <div className="content-name text-ellipsis-style">
                        {info.action_user_name}
                    </div>
                    <div className="content-text">赞了这条动态</div>
                    <div className="content-time">
                        {timeFormat(info.created_at, "YYYY/MM/DD HH:mm")}
                    </div>

                    <div className="dynamic-wrapper">
                        <div className="dynamic-name text-ellipsis-style">
                            {`@${info.dynamic_user_name}`}
                        </div>

                        <div className="dynamic-content">
                            看到建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                            11pro拍摄。建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                            11pro拍摄。看到建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                            11pro拍摄。建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                            11pro拍摄。看到建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                            11pro拍摄。建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                            11pro拍摄。
                        </div>
                    </div>

                    <div className="dynamic-img-wrapper">
                        <div className="dynamic-img">
                            <img src="" className="img-style" />
                        </div>
                        <div className="dynamic-content">
                            <div className="dynamic-name text-ellipsis-style">
                                {`@${info.dynamic_user_name}`}
                            </div>

                            <div className="dynamic-text">
                                看到建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。看到建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。看到建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。
                            </div>
                        </div>
                    </div>

                    <div className="dynamic-video-wrapper">
                        <div className="dynamic-video">
                            <img
                                src={info.dynamic_cover}
                                className="img-style"
                            />
                            <div className="video-mask">
                                <CaretRightOutlined className="icon-style" />
                            </div>
                        </div>
                        <div className="dynamic-content">
                            <div className="dynamic-name text-ellipsis-style">
                                {`@${info.dynamic_user_name}`}
                            </div>

                            <div className="video-title text-ellipsis-style">
                                {info.dynamic_content||"12312321"}
                            </div>

                            <div className="dynamic-text text-ellipsis-style">
                                看到建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。看到建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。看到建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。建筑找对称，见水拍倒影，当然，玻璃，镜子也是可以利用的小米
                                11pro拍摄。
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
