import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Button, Col, Divider, Input, Popconfirm, Row } from "antd";
import {
    CaretRightOutlined,
    PlusOutlined,
    RightOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import {
    CollectionIcon,
    LikeIcon,
    PlayIcon,
    ReplyIcon,
    UploadImgIcon,
} from "../public/icons";
// import ImgCropper from "./modal/ImgCropper";
import { API } from "../types/api";
import { timeFormat } from "../utils/timeTool";
import { useDebounce, useGetState, useMemoizedFn } from "ahooks";
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
import MediaShow from "./modal/MediaShow";
import { ImgShow } from "./baseComponents/ImgShow";
import { CollapseText } from "./baseComponents/CollapseText";
import { DynamicContentGenerate } from "./DynamicContentGenerate";

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

    isRole?: boolean;
    onRoleDel?: () => any;
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
        isRole = false,
        onRoleDel,
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

    const judgeAuth = useMemoizedFn(() => {
        if (!userInfo.isLogin) {
            failed("请登录后重新操作");
            return false;
        }
        return true;
    });
    const judgeRole = useMemoizedFn(() => {
        if (!userInfo.isLogin) {
            failed("无权操作");
            return false;
        }
        return true;
    });

    const [followLoading, setFollowLoading, getFollowLoading] =
        useGetState<boolean>(false);
    const [collectLoading, setCollectLoading] = useState<boolean>(false);
    const [starsLoading, setStarsLoading] = useState<boolean>(false);

    const [commentLoading, setCommentLoading] = useState<boolean>(false);
    const [showComment, setShowComment] = useState<boolean>(false);
    const [comment, setComment] = useState<API.NewDynamicComment>({
        ...DefaultCommentInfo,
    });

    const [listLoading, setListloading, getListloading] =
        useGetState<boolean>(false);
    const [listPage, setListPage] = useState<number>(1);
    const [commentList, setCommentList] = useState<API.DynamicComment>({
        data: [],
        pagemeta: { page: 1, limit: 10, total: 0, total_page: 1 },
    });

    const nextPage = useMemoizedFn((e: Event) => {
        if (!isDetail) return;
        if (getListloading()) return;
        if (commentList.data.length === commentList.pagemeta.total) return;

        if (e && e.target && (e.target as any).scrollingElement) {
            const scroll = (e.target as any).scrollingElement as HTMLElement;
            if (
                scroll.scrollTop + scroll.clientHeight >=
                scroll.scrollHeight - 100
            ) {
                const pages = listPage;
                setListPage(pages + 1);
                fetchAllComment(pages + 1);
            }
        }
    });
    useEffect(() => {
        if (isDetail) document.addEventListener("scroll", nextPage);
        return () => {
            window.removeEventListener("scroll", nextPage);
        };
    }, []);

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
        if (comment.message && comment.message.length > 150) {
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
        if (getFollowLoading()) return;

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
    const fetchAllComment = useMemoizedFn((page?: number) => {
        if (getListloading()) return;

        setListloading(true);
        NetWorkApi<FetchMainComments, API.DynamicComment>({
            method: "get",
            url: "/api/forum/comment",
            params: {
                page: page || listPage,
                limit: 10,
                order: "desc",
                dynamic_id: info.id,
            },
        })
            .then((res) => {
                setCommentList({
                    data: commentList.data.concat(res.data || []),
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

    const visitUserInfo = useMemoizedFn((id: number) => {
        if (userInfo.user_id === id) {
            router.push({
                pathname: "/userinfo",
                query: { tabs: "dynamic" },
            });
        } else {
            router.push({
                pathname: "/userpage",
                query: { user: id },
            });
        }
    });

    return (
        <div className="comment-item-wrapper">
            <div className="comment-item-body">
                <div className="item-left-body">
                    <div className="body-img">
                        <ImgShow
                            src={info.head_img}
                            onclick={() => visitUserInfo(info.user_id)}
                        />
                    </div>
                </div>

                <div className="item-right-body">
                    <div className="body-avatar">
                        <div className="avatar-info">
                            <div
                                className="avatar-info-name"
                                onClick={() => visitUserInfo(info.user_id)}
                            >
                                {info.user_name}
                            </div>
                            <div className="avatar-info-time">
                                {timeFormat(info.created_at, "MM-DD HH:mm")}
                            </div>
                        </div>
                        <div className="avatar-follow">
                            {isRole && (
                                <Popconfirm
                                    placement="bottomLeft"
                                    title="确定是否删除该动态吗?"
                                    onConfirm={() => {
                                        if (!judgeRole()) return;
                                        if (onRoleDel) onRoleDel();
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
                            )}
                            {userInfo.user_id !== info.user_id && (
                                <Button
                                    className={`avatar-follow-btn ${
                                        info.is_follow
                                            ? "followed-style"
                                            : "follow-style"
                                    }`}
                                    disabled={followLoading}
                                    onClick={() => {
                                        if (!judgeAuth()) return;
                                        followUser();
                                    }}
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
                                            if (!judgeAuth()) return;
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
                                            if (!judgeAuth()) return;
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
                            {info.status === 2 && (
                                <div className="del-dynamic-info">
                                    <InfoCircleOutlined className="icon-style" />
                                    抱歉、此动态已被删除
                                </div>
                            )}
                            {info.status !== 2 && !imgs && !videos && (
                                <CommentWord info={info} />
                            )}
                            {info.status !== 2 && imgs && (
                                <CommentImg info={info} />
                            )}
                            {info.status !== 2 && videos && (
                                <CommentVideo info={info} />
                            )}
                        </div>

                        {info.status !== 2 && (
                            <div className="body-operation">
                                <Row>
                                    <Col span={8}>
                                        <div
                                            className="body-operation-btn"
                                            onClick={() => {
                                                if (!judgeAuth()) return;
                                                userAction("collect");
                                            }}
                                        >
                                            <CollectionIcon
                                                className={`icon-style ${
                                                    info.is_collect
                                                        ? "text-active"
                                                        : "text-normal"
                                                }`}
                                            />

                                            <span
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
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
                                            <ReplyIcon
                                                className={`icon-style ${
                                                    isDetail || showComment
                                                        ? "text-active"
                                                        : "text-normal"
                                                }`}
                                            />

                                            <span
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
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
                                            onClick={() => {
                                                if (!judgeAuth()) return;
                                                userAction("stars");
                                            }}
                                        >
                                            <LikeIcon
                                                className={`icon-style ${
                                                    info.is_stars
                                                        ? "text-active"
                                                        : "text-normal"
                                                }`}
                                            />

                                            <span
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
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
                        )}
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
                            onKeyDown={(e) => {
                                if (e.code == "Enter") e.preventDefault();
                            }}
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
                                            !userInfo.isLogin ||
                                            (comment.message_img &&
                                                comment.message_img.length >= 3)
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
                                    onClick={() => {
                                        if (!judgeAuth()) return;
                                        publishComment();
                                    }}
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
                            {listLoading && (
                                <div className="list-loading">
                                    正在加载中...
                                </div>
                            )}
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
            <CollapseText
                value={<DynamicContentGenerate content={info.content} />}
            />
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

    const [isShow, setIsShow] = useState<boolean>(false);
    const [showIndex, setShowIndex] = useState<number>(0);

    return (
        <div className="comment-img-wrapper">
            <CollapseText
                value={<DynamicContentGenerate content={info.content} />}
            />
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
                                <ImgShow
                                    src={item}
                                    onclick={() => {
                                        setShowIndex(index);
                                        setTimeout(() => setIsShow(true), 100);
                                    }}
                                />
                                {index === 8 && arr.length < imgs.length && (
                                    <div
                                        className="img-grid-opt-mask"
                                        onClick={() => {
                                            setShowIndex(9);
                                            setTimeout(
                                                () => setIsShow(true),
                                                100
                                            );
                                        }}
                                    >{`+${imgs.length - arr.length}`}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {isShow && (
                <MediaShow
                    imgs={imgs}
                    imgsIndex={showIndex}
                    visible={isShow}
                    onCancel={() => setIsShow(false)}
                />
            )}
        </div>
    );
};
// 动态视频组件
interface CommentVideoProp {
    info: API.DynamicLists;
}
const CommentVideo: React.FC<CommentVideoProp> = (props) => {
    const { info } = props;

    const [isShow, setIsShow] = useState<boolean>(false);

    return (
        <div className="comment-video-wrapper">
            <CollapseText
                value={<DynamicContentGenerate content={info.content} />}
            />
            <div className="comment-video-body">
                <ImgShow isCover={true} src={info.cover} />
                <div
                    className="comment-video-mask"
                    onClick={() => setIsShow(true)}
                >
                    <PlayIcon className="icon-style" />
                </div>
            </div>
            {isShow && (
                <MediaShow
                    isVideo={true}
                    video={info.content_video}
                    visible={isShow}
                    onCancel={() => setIsShow(false)}
                />
            )}
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
            <ImgShow src={src} />
            <div className="img-opt-del" onClick={() => onDel(index)}>
                x
            </div>
        </div>
    );
};
