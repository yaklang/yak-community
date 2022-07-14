import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { Button } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { SearchPageMeta, StarsComment } from "../../types/extraApi";
import { timeFormat } from "../../utils/timeTool";
import {
    LikeIcon,
    LikeThemeIcon,
    ReplyIcon,
    ReplyThemeIcon,
} from "../../public/icons";
import PostComment from "../modal/PostComment";

interface MessageCommentProps {}

const MessageComment: NextPage<MessageCommentProps> = (props) => {
    const [lists, setLists] = useState<API.MessageCenterCommentResponse>({
        data: [{ id: 1 }],
        pagemeta: { page: 1, limit: 20, total: 0, total_page: 1 },
    });

    const fetchLists = useMemoizedFn(() => {
        NetWorkApi<SearchPageMeta, API.MessageCenterCommentResponse>({
            method: "get",
            url: "/api/message/center/content",
            params: {
                Page: 1,
                Limit: 20,
                Order: "desc",
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
        <div className="message-comment-wrapper">
            <div className="message-comment-hint">
                共 {lists.pagemeta.total} 条评论信息
            </div>
            {lists.data.map((item, index) => {
                return <CommentMessage key={item.id} info={item} />;
            })}
        </div>
    );
};

export default MessageComment;

// 点赞组件
interface CommentMessageProp {
    info: API.MessageCenterComment;
}
const CommentMessage: React.FC<CommentMessageProp> = (props) => {
    const { info } = props;

    const [replyShow, setReplyShow] = useState<boolean>(false);

    const [starsLoading, setStarLoading] = useState<boolean>(false);
    const [starShow, setStarShow] = useState<boolean>(false);
    const onStar = useMemoizedFn(() => {
        setStarShow(!starShow);

        if (starsLoading) return;

        setStarLoading(true);
        NetWorkApi<StarsComment, API.ActionSucceeded>({
            method: "post",
            url: "/api/forum/comment/stars",
            params: {
                comment_id: info.id,
                operation: starShow ? "remove" : "add",
            },
            userToken: true,
        })
            .then((res) => {
                setStarShow(!starShow);
                console.log(res);
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setStarLoading(false), 100));
    });

    return (
        <div className="comment-message-wrapper">
            <div className="comment-message-reply">
                <div className="reply-img">
                    <img src={info.by_head_img} className="img-style" />
                </div>

                <div className="reply-content">
                    <div className="reply-name text-ellipsis-style">
                        {info.by_user_name || "123"}
                    </div>
                    <div className="reply-body">{info.by_message}</div>
                    <div className="reply-time">
                        {timeFormat(info.created_at, "YYYY/MM/DD HH:mm")}
                    </div>
                </div>
            </div>

            {/* <div className="comment-message-dynamic">
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
                        <img src={info.dynamic_cover} className="img-style" />
                        <div className="video-mask">
                            <CaretRightOutlined className="icon-style" />
                        </div>
                    </div>
                    <div className="dynamic-content">
                        <div className="dynamic-name text-ellipsis-style">
                            {`@${info.dynamic_user_name}`}
                        </div>

                        <div className="video-title text-ellipsis-style">
                            {info.dynamic_content || "12312321"}
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
            </div> */}

            <div className="comment-message-dynamic-reply">
                <div className="dynamic-reply-content">
                    <a></a>
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
                        <img src={info.dynamic_cover} className="img-style" />
                        <div className="video-mask">
                            <CaretRightOutlined className="icon-style" />
                        </div>
                    </div>
                    <div className="dynamic-content">
                        <div className="dynamic-name text-ellipsis-style">
                            {`@${info.dynamic_user_name}`}
                        </div>

                        <div className="video-title text-ellipsis-style">
                            {info.dynamic_content || "12312321"}
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

            <div className="comment-message-operate">
                <div className="operate-btn">
                    <Button
                        type="link"
                        className="btn-style"
                        onClick={() => setReplyShow(true)}
                    >
                        <ReplyIcon className="icon-style" />
                        回复
                    </Button>
                </div>
                <div className="operate-btn">
                    <Button
                        type="link"
                        className={`btn-style ${
                            starShow ? "btn-theme-style" : ""
                        }`}
                        onClick={onStar}
                    >
                        {starShow ? (
                            <LikeThemeIcon className="icon-style" />
                        ) : (
                            <LikeIcon className="icon-style" />
                        )}
                        点赞
                    </Button>
                </div>
            </div>

            <PostComment
                dynamicId={info.dynamic_id}
                mainCommentId={info.dynamic_id}
                commentId={info.id}
                commentUserId={info.user_id}
                name={info.user_name}
                visible={replyShow}
                onCancel={() => setReplyShow(false)}
            />
        </div>
    );
};
