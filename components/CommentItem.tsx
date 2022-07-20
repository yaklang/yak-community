import React, { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Button, Col, Divider, Input, Popconfirm, Row } from "antd";
import {
    CaretRightOutlined,
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
    UserCollectLikeProps,
} from "../types/extraApi";
import { useStore } from "../store";
import { SingleUpload } from "./baseComponents/SingleUpload";
import { failed } from "../utils/notification";
import PostComment from "./modal/PostComment";
import { SendCommentPng, SendCommentThemePng } from "../utils/btnImgBase64";
import { CommentContentInfo } from "./CommentContentInfo";

const { TextArea } = Input;

//评论数据默认值
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
    updateDynamicInfo?: (id: number) => any;
    isDetail?: boolean;
    isOwner?: boolean;
    onEdit?: () => any;
    onDel?: () => any;
}

const CommentItem: NextPage<CommentItemProps> = (props) => {
    const {
        info,
        updateInfo,
        updateDynamicInfo,
        isDetail = false,
        isOwner = false,
        onEdit,
        onDel,
    } = props;
    const imgs: string[] =
        !info.content_img || info.content_img === "null"
            ? undefined
            : JSON.parse(info.content_img);
    const videos =
        !info.content_video || info.content_video === "null"
            ? undefined
            : info.content_video;

    const { userInfo } = useStore();
    const router = useRouter();

    const [followLoading, setFollowLoading] = useState<boolean>(false);
    const [collectLoading, setCollectLoading] = useState<boolean>(false);
    const [starsLoading, setStarsLoading] = useState<boolean>(false);

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
    // const [signCommentId, setSignCommentId] = useState<number>(0);

    const addCommentReply = useMemoizedFn((id: number) => {
        setCommentList({
            data: commentList.data.map((item) => {
                if (item.id === id) {
                    item.reply_num = item.reply_num + 1;
                }
                return item;
            }),
            pagemeta: commentList.pagemeta,
        });
    });
    const changeCommentLike = useMemoizedFn((id: number, isStar: boolean) => {
        setCommentList({
            data: commentList.data.map((item) => {
                if (item.id === id) {
                    item.like_num = isStar
                        ? item.like_num - 1
                        : item.like_num + 1;
                }
                return item;
            }),
            pagemeta: commentList.pagemeta,
        });
        // setSignCommentId(isStar ? 0 : id);
    });

    const delReplyImg = useMemoizedFn((index: number) => {
        if (!comment.message_img) return;
        const imgs = [...comment.message_img];
        imgs.splice(index, 1);
        setComment({
            ...comment,
            message_img: imgs,
        });
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
            .then((res) => {
                setComment({ ...DefaultCommentInfo });
                fetchThreeeComment();
                if (updateDynamicInfo) updateDynamicInfo(info.id);
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setCommentLoading(false), 300));
    });

    // 关注按钮功能
    const followUser = useMemoizedFn(() => {
        if (followLoading) return;

        setFollowLoading(true);
        NetWorkApi<FollowUserProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/user/follow",
            params: {
                follow_user_id: info.user_id,
                operation: info.is_follow ? "remove" : "add",
            },
            userToken: true,
        })
            .then((res) => {
                const data: API.DynamicLists = cloneDeep(info);
                data.is_follow = !data.is_follow;
                if (updateInfo) updateInfo("user", data);
            })
            .catch((err) => {})
            .finally(() => setFollowLoading(false));
    });
    // 收藏/点赞按钮操作
    const userAction = useMemoizedFn((type: "collect" | "stars") => {
        if (type === "collect" && collectLoading) return;
        if (type === "stars" && starsLoading) return;

        const flag = type === "collect" ? info.is_collect : info.is_stars;

        if (type === "collect") setCollectLoading(true);
        else setStarsLoading(true);
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
            .catch((err) => {})
            .finally(() => {
                if (type === "collect") setCollectLoading(false);
                else setStarsLoading(false);
            });
    });

    const commentMore = () => {
        router.push(`/dynamic?id=${info.id}`);
    };

    // 查询动态主评论(前3条)
    const fetchThreeeComment = useMemoizedFn(() => {
        setListloading(true);
        NetWorkApi<FetchMainComments, API.DynamicComment>({
            method: "get",
            url: "/api/forum/comment",
            params: {
                page: 1,
                limit: 3,
                order: "desc",
                dynamic_id: info.id,
            },
            userToken: true,
        })
            .then((res) => {
                setCommentList({
                    data: res.data || [],
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setListloading(false), 300));
    });

    // 查询动态主评论(所有)
    const fetchAllComment = useMemoizedFn(() => {
        setListloading(true);
        NetWorkApi<FetchMainComments, API.DynamicComment>({
            method: "get",
            url: "/api/forum/comment",
            params: {
                page: 1,
                limit: 10,
                order: "desc",
                dynamic_id: info.id,
            },
            userToken: true,
        })
            .then((res) => {
                setCommentList({
                    data: res.data || [],
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setListloading(false), 300));
    });

    useEffect(() => {
        if (showComment) fetchThreeeComment();
    }, [useDebounce(showComment, { wait: 300 })]);

    useEffect(() => {
        if (isDetail) fetchAllComment();
    }, [isDetail]);

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
                                    disabled={followLoading}
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
                                            {info.comment_num}
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
                            maxLength={150}
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
                                                        <ReplyFunctionImg
                                                            key={item}
                                                            src={item}
                                                            index={index}
                                                            onDel={(index) =>
                                                                delReplyImg(
                                                                    index
                                                                )
                                                            }
                                                        />
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
                                            comment.message_img &&
                                            comment.message_img.length >= 3
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
                                                ? SendCommentThemePng
                                                : SendCommentPng
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
                                    <CommentContentInfo
                                        key={item.id}
                                        dynamicInfo={info}
                                        info={item}
                                        onReply={(commentInfo) =>
                                            publishReply(commentInfo)
                                        }
                                        updateCommentStar={changeCommentLike}
                                        updateCommentNum={addCommentReply}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="comment-content-container">
                            {commentList.data.map((item, index) => {
                                return (
                                    <CommentContentInfo
                                        key={item.id}
                                        dynamicInfo={info}
                                        info={item}
                                        onReply={(commentInfo) =>
                                            publishReply(commentInfo)
                                        }
                                        updateCommentStar={changeCommentLike}
                                        updateCommentNum={addCommentReply}
                                    />
                                );
                            })}
                            {info.comment_num > 3 && (
                                <div className="comment-content-more">
                                    <span
                                        className="text-style"
                                        onClick={commentMore}
                                    >
                                        {`查看全部 ${info.comment_num} 条评论 `}
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
                    dynamicId={info.id}
                    mainCommentId={replyComment.id}
                    commentId={replyComment.id}
                    commentUserId={replyComment.user_id}
                    name={replyComment.user_name}
                    visible={replyShow}
                    onCancel={(flag) => {
                        if (flag) addCommentReply(replyComment.id);
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
    const imgs: string[] =
        !info.content_img || info.content_img === "null"
            ? undefined
            : JSON.parse(info.content_img);
    const arr = imgs.length > 9 ? imgs.slice(0, 9) : [...imgs];

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
                                <img className="img-style" src={item} />
                                {index === 8 && arr.length < imgs.length && (
                                    <div className="img-grid-opt-mask">{`+${
                                        imgs.length - arr.length
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

    const [top, setTop] = useState<number>(0);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!imgRef || !imgRef.current) return;

        const img = imgRef.current;
        setTop(img.offsetHeight / 2 - 178);
    }, [imgRef.current]);

    return (
        <div className="comment-video-wrapper">
            <CollapseParagraph value={info.content} rows={3} />
            <div className="comment-video-body">
                <img
                    ref={imgRef}
                    style={{ top: -top }}
                    src={info.cover}
                    className="img-style"
                />
                <div className="comment-video-mask">
                    <CaretRightOutlined className="icon-style" />
                </div>
            </div>
        </div>
    );
};

// 评论功能图片展示
interface ReplyFunctionImgProps {
    src: string;
    index: number;
    onDel: (index: number) => any;
}
const ReplyFunctionImg: React.FC<ReplyFunctionImgProps> = (props) => {
    const { src, index, onDel } = props;

    return (
        <div className="reply-img-opt" key={index}>
            <img src={src} className="img-style" />
            <div className="img-opt-del" onClick={() => onDel(index)}>
                x
            </div>
        </div>
    );
};
