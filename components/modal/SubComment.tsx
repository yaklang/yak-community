import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { Modal } from "antd";
import { API } from "../../types/api";
import { CommentContent } from "../CommentItem";
import { CollapseParagraph } from "../baseComponents/CollapseParagraph";
import { timeFormat } from "../../utils/timeTool";
import { LikeIcon, LikeThemeIcon, ReplyIcon } from "../../public/icons";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { FetchSubComments, StarsComment } from "../../types/extraApi";
import PostComment from "./PostComment";

interface SubCommentProps {
    dynamicInfo: API.DynamicLists;
    info: API.DynamicCommentList;
    width?: number;
    visible: boolean;
    onCancel: () => any;
}

const SubComment: NextPage<SubCommentProps> = (props) => {
    const { dynamicInfo, info, width, visible, onCancel } = props;

    const [loading, setLoading] = useState<boolean>(false);
    const [lists, setLists] = useState<API.DynamicComment>({
        data: [
            {
                id: 1,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                dynamic_id: 1,
                root_id: 0,
                parent_id: 0,
                user_id: 1,
                user_name: "123",
                head_img: "",
                message: "123132",
                message_img: "",
                like_num: 12,
                by_user_id: 2,
                by_user_name: "321",
                by_head_img: "",
                reply_num: 22,
            },
            {
                id: 1,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                dynamic_id: 1,
                root_id: 0,
                parent_id: 0,
                user_id: 1,
                user_name: "123",
                head_img: "",
                message: "123132",
                message_img: "",
                like_num: 12,
                by_user_id: 2,
                by_user_name: "321",
                by_head_img: "",
                reply_num: 22,
            },
            {
                id: 1,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                dynamic_id: 1,
                root_id: 0,
                parent_id: 0,
                user_id: 1,
                user_name: "123",
                head_img: "",
                message: "123132",
                message_img: "",
                like_num: 12,
                by_user_id: 2,
                by_user_name: "321",
                by_head_img: "",
                reply_num: 22,
            },
            {
                id: 1,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                dynamic_id: 1,
                root_id: 0,
                parent_id: 0,
                user_id: 1,
                user_name: "123",
                head_img: "",
                message: "123132",
                message_img: "",
                like_num: 12,
                by_user_id: 2,
                by_user_name: "321",
                by_head_img: "",
                reply_num: 22,
            },
        ],
        pagemeta: { page: 1, limit: 5, total: 2, total_page: 1 },
    });

    const fetchSubCommentList = useMemoizedFn(() => {
        setLoading(true);
        NetWorkApi<FetchSubComments, API.DynamicComment>({
            method: "get",
            url: "/api/forum/comment/reply",
            params: {
                Page: 1,
                Limit: 10,
                Order: "desc",
                root_id: info.id,
                dynamic_id: dynamicInfo.id,
            },
            userToken: true,
        })
            .then((res) => {
                setLists({
                    data: res.data || [],
                    pagemeta: res.pagemeta,
                });
                console.log(res);
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 300));
    });

    useEffect(() => {
        fetchSubCommentList();
    }, []);

    const [replyShow, setReplyShow] = useState<boolean>(false);
    const [replyComment, setReplyComment] = useState<API.DynamicCommentList>();
    //发表回复
    const publishReply = useMemoizedFn((item: API.DynamicCommentList) => {
        setReplyComment(item);
        setTimeout(() => setReplyShow(true), 50);
    });

    return (
        <Modal
            centered={true}
            footer={null}
            className="sub-comment-modal"
            width={width || 662}
            title={`共 ${info.reply_num} 条回复`}
            visible={visible}
            onCancel={() => onCancel()}
        >
            <div className="sub-comment-wrapper">
                <div className="main-comment-body">
                    <CommentContent
                        info={info}
                        onReply={(commentInfo) => publishReply(commentInfo)}
                        isShowMore={false}
                    />
                </div>

                <div className="sub-comment-body">
                    {lists.data.map((item, index) => {
                        return (
                            <SubCommentContent
                                info={item}
                                onReply={(commentInfo) =>
                                    publishReply(commentInfo)
                                }
                            />
                        );
                    })}
                </div>

                {replyComment && (
                    <PostComment
                        dynamicInfo={dynamicInfo}
                        mainCommentInfo={info}
                        commentInfo={replyComment}
                        visible={replyShow}
                        onCancel={() => setReplyShow(false)}
                    />
                )}
            </div>
        </Modal>
    );
};

export default SubComment;

// 子评论内容组件
interface SubCommentContentProps {
    info: API.DynamicCommentList;
    onReply: (item: API.DynamicCommentList) => any;
}
const SubCommentContent: React.FC<SubCommentContentProps> = (props) => {
    const { info, onReply } = props;
    const imgs: string[] =
        info.message_img && info.message_img !== "null"
            ? JSON.parse(info.message_img)
            : [];
    const row = info.message.split("\n");

    const [loading, setLoading] = useState<boolean>(false);
    const [flag, setFlag] = useState<boolean>(false);
    //评论点赞操作
    const onLike = useMemoizedFn(() => {
        if (loading) return;

        setLoading(true);
        NetWorkApi<StarsComment, API.ActionSucceeded>({
            method: "post",
            url: "/api/forum/comment/stars",
            params: {
                comment_id: info.id,
                operation: flag ? "remove" : "add",
            },
            userToken: true,
        })
            .then((res) => {
                setFlag(!flag);
                console.log(res);
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 100));
    });

    return (
        <div className="sub-comment-content-wrapper">
            <div className="sub-comment-content-body">
                <div className="body-img">
                    <img src={info.head_img} className="img-style" />
                </div>

                <div className="body-data">
                    <div className="body-data-name text-ellipsis-style">
                        {info.user_name}
                    </div>

                    <div className="body-data-text">
                        <CollapseParagraph
                            value={
                                <>
                                    {info.message}
                                    {imgs.map((item) => {
                                        return (
                                            <a
                                                className="comment-content-img"
                                                href={item}
                                                target="_blank"
                                            >
                                                [图片]
                                            </a>
                                        );
                                    })}
                                </>
                            }
                            rows={2}
                        />
                        {/* <CollapseText value={"fwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefofwfwfwefwenfownefo"} /> */}
                    </div>

                    <div className="body-data-time-operation">
                        <div className="body-data-time">
                            {timeFormat(info.created_at, "YYYY/MM/DD HH:mm")}
                        </div>
                        <div className="body-data-operation">
                            <div
                                className="operation-btn"
                                onClick={() => onReply(info)}
                            >
                                <ReplyIcon className="icon-style" />
                            </div>
                            <div className="operation-btn" onClick={onLike}>
                                {flag ? (
                                    <LikeThemeIcon className="icon-style" />
                                ) : (
                                    <LikeIcon className="icon-style" />
                                )}
                                {flag ? info.like_num + 1 : info.like_num}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
