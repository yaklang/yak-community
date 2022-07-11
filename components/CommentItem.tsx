import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Button, Col, Divider, Input, Popconfirm, Row } from "antd";
import {
    CaretRightOutlined,
    CaretDownOutlined,
    PlusOutlined,
    RightOutlined,
} from "@ant-design/icons";
import {
    CollectionIcon,
    CollectionThemeIcon,
    LikeIcon,
    LikeThemeIcon,
    ReplyIcon,
    ReplyThemeIcon,
    UploadImgIcon,
} from "../public/icons";
import { CollapseParagraph } from "./baseComponents/CollapseParagraph";
import ImgCropper from "./modal/ImgCropper";
import { API } from "../types/api";
import { timeFormat } from "../utils/timeTool";
import { useDebounce, useMemoizedFn } from "ahooks";
import cloneDeep from "lodash/cloneDeep";
import { NetWorkApi } from "../utils/fetch";
import {
    FetchMainComments,
    FollowUserProps,
    StarsComment,
    UserCollectLikeProps,
} from "../types/extraApi";
import { useStore } from "../store";
import { SingleUpload } from "./baseComponents/SingleUpload";
import { failed } from "../utils/notification";
import { CollapseText } from "./baseComponents/CollapseText";
import PostComment from "./modal/PostComment";
import SubComment from "./modal/SubComment";

const { TextArea } = Input;

const DefaultCommentInfo: API.NewDynamicComment = {
    dynamic_id: 0,
    message_img: [],
    parent_id: 0,
    by_user_id: 0,
    root_id: 0,
    message: "",
};

interface CommentItemProps {
    info: API.DynamicLists;
    updateInfo?: (
        type: "user" | "stars" | "collect",
        info: API.DynamicLists
    ) => any;
    isDetail?: boolean;
    isOwner?: boolean;
    onEdit?: () => any;
    onDel?: () => any;
}

const CommentItem: NextPage<CommentItemProps> = (props) => {
    const {
        info,
        updateInfo,
        isDetail = false,
        isOwner = false,
        onEdit,
        onDel,
    } = props;
    const imgs =
        !info.content_img || info.content_img === "null"
            ? null
            : JSON.parse(info.content_img);
    const videos =
        !info.content_video || info.content_video === "null"
            ? null
            : JSON.parse(info.content_video);

    const { userInfo } = useStore();
    const router = useRouter();

    const [commentLoading, setCommentLoading] = useState<boolean>(false);
    const [showComment, setShowComment] = useState<boolean>(false);
    const [comment, setComment] = useState<API.NewDynamicComment>({
        ...DefaultCommentInfo,
    });

    const [listLoading, setListloading] = useState<boolean>(false);
    const [commentList, setCommentList] = useState<API.DynamicComment>({
        data: [],
        pagemeta: { page: 1, limit: 10, total: 0, total_page: 1 },
    });

    const publishComment = useMemoizedFn(() => {
        if (comment.message.length > 150) {
            failed("评论内容限制长度为150个字以内");
            return;
        }

        if (commentLoading) return;

        let params: API.NewDynamicComment = {
            dynamic_id: info.id,
            parent_id: 0,
            by_user_id: info.user_id,
            root_id: 0,
            message: comment.message,
        };
        if (comment.message_img && comment.message_img.length > 0)
            params.message_img = comment.message_img;

        setCommentLoading(true);
        NetWorkApi<API.NewDynamicComment, API.ActionSucceeded>({
            method: "post",
            url: "/api/forum/comment",
            data: { ...params },
            userToken: true,
        })
            .then((res) => setComment({ ...DefaultCommentInfo }))
            .catch((err) => {})
            .finally(() => setTimeout(() => setCommentLoading(false), 300));
    });

    // 关注按钮功能
    const followUser = useMemoizedFn(() => {
        NetWorkApi<FollowUserProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/follow",
            params: {
                follow_user_id: info.updated_at,
                operation: info.is_follow ? "remove" : "add",
            },
            userToken: true,
        })
            .then((res) => {
                const data: API.DynamicLists = cloneDeep(info);
                data.is_collect = !data.is_collect;
                if (updateInfo) updateInfo("user", data);
            })
            .catch((err) => {});
    });
    //收藏/点赞按钮操作
    const userAction = useMemoizedFn((type: "collect" | "stars") => {
        const flag = type === "collect" ? info.is_collect : info.is_stars;

        NetWorkApi<UserCollectLikeProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/action",
            params: {
                dynamic_id: info.id,
                type,
                operation: flag ? "remove" : "add",
            },
            userToken: true,
        })
            .then((res) => {
                const data: API.DynamicLists = cloneDeep(info);
                if (type === "collect") {
                    data.collect = data.is_collect
                        ? data.collect - 1
                        : data.collect + 1;
                    data.is_collect = !data.is_collect;
                }
                if (type === "stars") {
                    data.stars = data.is_stars
                        ? data.stars - 1
                        : data.stars + 1;
                    data.is_stars = !data.is_stars;
                }
                if (updateInfo) updateInfo(type, data);
            })
            .catch((err) => {});
    });

    const commentMore = () => {
        router.push(`/dynamic?id=${info.id}`);
    };

    // 查询动态主评论(前5条)
    const fetchThreeComment = useMemoizedFn(() => {
        setCommentList({
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
            ],
            pagemeta: { page: 1, limit: 5, total: 1, total_page: 1 },
        });
        return;
        setListloading(true);
        NetWorkApi<FetchMainComments, API.DynamicComment>({
            method: "get",
            url: "/api/forum/comment",
            params: {
                Page: 1,
                Limit: 5,
                Order: "desc",
                dynamic_id: info.id,
            },
            userToken: true,
        })
            .then((res) => {
                setCommentList({
                    data: res.data || [],
                    pagemeta: res.pagemeta,
                });
                console.log(res);
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setListloading(false), 300));
    });

    useEffect(() => {
        if (showComment) fetchThreeComment();
    }, [useDebounce(showComment, { wait: 300 })]);

    const [replyShow, setReplyShow] = useState<boolean>(false);
    const [replyComment, setReplyComment] = useState<API.DynamicCommentList>();
    //发表回复
    const publishReply = useMemoizedFn((item: API.DynamicCommentList) => {
        setReplyComment(item);
        setTimeout(() => setReplyShow(true), 50);
    });

    return (
        <div className="comment-item-wrapper">
            <div className="comment-item-body">
                <div className="item-left-body">
                    <div className="body-img">
                        <img src={info.head_img} className="img-style" />
                    </div>
                </div>

                <div className="item-right-body">
                    <div className="body-avatar">
                        <div className="avatar-info">
                            <div className="avatar-info-name">
                                {info.user_name}
                            </div>
                            <div className="avatar-info-time">
                                {timeFormat(info.created_at, "MM-DD HH:mm")}
                            </div>
                        </div>
                        <div className="avatar-follow">
                            {userInfo.user_id !== info.user_id && (
                                <Button
                                    className={`avatar-follow-btn ${
                                        info.is_follow
                                            ? "followed-style"
                                            : "follow-style"
                                    }`}
                                    onClick={followUser}
                                >
                                    {info.is_follow ? "已关注" : "关注"}
                                </Button>
                            )}
                            {isOwner && (
                                <>
                                    <Button
                                        type="link"
                                        className="btn-style edit-btn"
                                        onClick={() => {
                                            if (onEdit) onEdit();
                                        }}
                                    >
                                        编辑
                                    </Button>
                                    <Divider
                                        type="vertical"
                                        className="btn-divider"
                                    />
                                    <Popconfirm
                                        placement="bottomLeft"
                                        title="确定是否删除该动态吗?"
                                        onConfirm={() => {
                                            if (onDel) onDel();
                                        }}
                                        okText="确定"
                                        cancelText="取消"
                                    >
                                        <Button
                                            type="link"
                                            className="btn-style del-btn"
                                        >
                                            删除
                                        </Button>
                                    </Popconfirm>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="body-container">
                        <div className="body-comment">
                            {!imgs && !videos && <CommentWord info={info} />}
                            {imgs && <CommentImg info={info} />}
                            {videos && <CommentVideo info={info} />}
                        </div>

                        <div className="body-operation">
                            <Row>
                                <Col span={8}>
                                    <div
                                        className="body-operation-btn"
                                        onClick={() => userAction("collect")}
                                    >
                                        {info.is_collect ? (
                                            <CollectionThemeIcon className="icon-style" />
                                        ) : (
                                            <CollectionIcon className="icon-style" />
                                        )}
                                        <span
                                            onClick={(e) => e.stopPropagation()}
                                            className={
                                                info.is_collect
                                                    ? "text-active"
                                                    : "text-normal"
                                            }
                                        >
                                            {info.collect}
                                        </span>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div
                                        className="body-operation-btn"
                                        onClick={() => {
                                            if (isDetail) return;
                                            setShowComment(!showComment);
                                        }}
                                    >
                                        {isDetail || showComment ? (
                                            <ReplyThemeIcon className="icon-style" />
                                        ) : (
                                            <ReplyIcon className="icon-style" />
                                        )}
                                        <span
                                            onClick={(e) => e.stopPropagation()}
                                            className={
                                                isDetail || showComment
                                                    ? "text-active"
                                                    : "text-normal"
                                            }
                                        >
                                            {+info.comment_num}
                                        </span>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div
                                        className="body-operation-btn"
                                        onClick={() => userAction("stars")}
                                    >
                                        {info.is_stars ? (
                                            <LikeThemeIcon className="icon-style" />
                                        ) : (
                                            <LikeIcon className="icon-style" />
                                        )}
                                        <span
                                            onClick={(e) => e.stopPropagation()}
                                            className={
                                                info.is_stars
                                                    ? "text-active"
                                                    : "text-normal"
                                            }
                                        >
                                            {info.stars}
                                        </span>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>

            {(isDetail || showComment) && (
                <div className="comment-item-reply">
                    <div className="comment-input-container">
                        <TextArea
                            placeholder="发布评论"
                            className="reply-input"
                            autoSize={{ minRows: 1, maxRows: 6 }}
                            value={comment.message}
                            onChange={(e) =>
                                setComment({
                                    ...comment,
                                    message: e.target.value,
                                })
                            }
                        />

                        <div className="reply-img-and-btn">
                            <div className="reply-full">
                                {comment.message_img &&
                                    comment.message_img.length > 0 && (
                                        <div className="reply-img">
                                            {comment.message_img.map(
                                                (item, index) => {
                                                    return (
                                                        <div
                                                            className="reply-img-opt"
                                                            key={index}
                                                        >
                                                            <img
                                                                src={item}
                                                                className="img-style"
                                                            />
                                                            <div
                                                                className="img-opt-del"
                                                                onClick={() => {
                                                                    if (
                                                                        !comment.message_img
                                                                    )
                                                                        return;
                                                                    const imgs =
                                                                        [
                                                                            ...comment.message_img,
                                                                        ];
                                                                    imgs.splice(
                                                                        index,
                                                                        1
                                                                    );
                                                                    setComment({
                                                                        ...comment,
                                                                        message_img:
                                                                            imgs,
                                                                    });
                                                                }}
                                                            >
                                                                x
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                            {comment.message_img.length < 3 && (
                                                <SingleUpload
                                                    setValue={(res) => {
                                                        setComment({
                                                            ...comment,
                                                            message_img:
                                                                comment.message_img?.concat(
                                                                    [res]
                                                                ),
                                                        });
                                                    }}
                                                >
                                                    <div className="reply-img-add">
                                                        <PlusOutlined className="icon-style" />
                                                    </div>
                                                </SingleUpload>
                                            )}
                                        </div>
                                    )}
                            </div>

                            <div className="reply-btn">
                                <SingleUpload
                                    setValue={(res) => {
                                        setComment({
                                            ...comment,
                                            message_img:
                                                comment.message_img?.concat([
                                                    res,
                                                ]),
                                        });
                                    }}
                                >
                                    <Button
                                        className="reply-btn-style"
                                        type="link"
                                        disabled={
                                            comment.message_img?.length === 3
                                        }
                                        icon={
                                            <UploadImgIcon className="icon-style" />
                                        }
                                    />
                                </SingleUpload>

                                <Button
                                    type="link"
                                    className="reply-btn-style img-btn-style"
                                    disabled={
                                        !comment.message || commentLoading
                                    }
                                    onClick={publishComment}
                                >
                                    <img
                                        src={`${
                                            !!comment.message
                                                ? "/images/btn/sendCommentTheme.png"
                                                : "/images/btn/sendComment.png"
                                        }`}
                                        className="img-style"
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {isDetail ? (
                        <div className="comment-content-container">
                            {commentList.data.map((item, index) => {
                                return (
                                    <CommentContent
                                        key={index}
                                        dynamicInfo={info}
                                        info={item}
                                        onReply={(commentInfo) =>
                                            publishReply(commentInfo)
                                        }
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="comment-content-container">
                            {commentList.data.map((item, index) => {
                                return (
                                    <CommentContent
                                        key={index}
                                        dynamicInfo={info}
                                        info={item}
                                        onReply={(commentInfo) =>
                                            publishReply(commentInfo)
                                        }
                                    />
                                );
                            })}
                            {(true || commentList.pagemeta.total > 5) && (
                                <div className="comment-content-more">
                                    <span
                                        className="text-style"
                                        onClick={commentMore}
                                    >
                                        {`查看全部 ${commentList.pagemeta.total} 条评论 `}
                                        <RightOutlined className="icon-style" />
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {replyComment && (
                <PostComment
                    dynamicInfo={info}
                    mainCommentInfo={replyComment}
                    commentInfo={replyComment}
                    visible={replyShow}
                    onCancel={() => {
                        setReplyShow(false);
                    }}
                />
            )}
        </div>
    );
};

export default CommentItem;

// 动态文字组件
interface CommentWordProp {
    info: API.DynamicLists;
}
const CommentWord: React.FC<CommentWordProp> = (props) => {
    const { info } = props;
    return (
        <div className="comment-word-wrapper">
            <CollapseParagraph value={info.content} rows={3} />
        </div>
    );
};
// 动态图片组件
interface CommentImgProp {
    info: API.DynamicLists;
}
const CommentImg: React.FC<CommentImgProp> = (props) => {
    const { info } = props;
    const arrs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <div className="comment-img-wrapper">
            <CollapseParagraph value={info.content} topic="话题" rows={3} />
            <div className="comment-img-body">
                <div
                    className={
                        arr.length !== 1 && arr.length % 3 === 1
                            ? "img-grid-four-wrapper"
                            : "img-grid-three-wrapper"
                    }
                >
                    {arr.map((item, index) => {
                        return (
                            <div className="img-grid-opt" key={index}>
                                <img
                                    className="img-style"
                                    src="https://img2.baidu.com/it/u=586743041,2475093996&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500"
                                />
                                {index === 8 && arr.length < arrs.length && (
                                    <div className="img-grid-opt-mask">{`+${
                                        arrs.length - arr.length
                                    }`}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
// 动态视频组件
interface CommentVideoProp {
    info: API.DynamicLists;
}
const CommentVideo: React.FC<CommentVideoProp> = (props) => {
    const { info } = props;
    return (
        <div className="comment-video-wrapper">
            <CollapseParagraph value={info.content} rows={3} />
            <div className="comment-video-body">
                <img src={info.cover} className="img-style" />
                <div className="comment-video-mask">
                    <CaretRightOutlined className="icon-style" />
                </div>
            </div>
        </div>
    );
};

// 评论内容组件
interface CommentContentProp {
    dynamicInfo?: API.DynamicLists;
    info: API.DynamicCommentList;
    onReply: (item: API.DynamicCommentList) => any;
    isShowMore?: boolean;
}
export const CommentContent: React.FC<CommentContentProp> = (props) => {
    const { dynamicInfo, info, onReply, isShowMore = true } = props;
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

    const [moreShow, setMoreShow] = useState<boolean>(false);

    return (
        <div
            className={`${
                isShowMore
                    ? "comment-content-wrapper"
                    : "comment-more-content-wrapper"
            }`}
        >
            <div className="comment-content-body">
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
                                {info.reply_num}
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

                    {isShowMore && !!info.reply_num && (
                        <div
                            className="body-data-more"
                            onClick={() => setMoreShow(true)}
                        >
                            {`共 ${info.reply_num} 条回复`}
                            <CaretDownOutlined className="icon-style" />
                        </div>
                    )}
                </div>
            </div>
            {dynamicInfo && (
                <SubComment
                    dynamicInfo={dynamicInfo}
                    info={info}
                    visible={moreShow}
                    onCancel={() => setMoreShow(false)}
                />
            )}
        </div>
    );
};
