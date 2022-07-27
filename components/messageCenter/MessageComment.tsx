import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { Button } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { useGetState, useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { SearchPageMeta, StarsComment } from "../../types/extraApi";
import { timeFormat } from "../../utils/timeTool";
import { LikeIcon, LikeThemeIcon, ReplyIcon } from "../../public/icons";
import PostComment from "../modal/PostComment";
import { useRouter } from "next/router";

interface MessageCommentProps {}

const MessageComment: NextPage<MessageCommentProps> = (props) => {
    const [listPage, setListPage] = useState<number>(1);
    const [loading, setLoading, getLoading] = useGetState<boolean>(false);
    const [lists, setLists] = useState<API.MessageCenterCommentResponse>({
        data: [],
        pagemeta: { page: 1, limit: 10, total: 0, total_page: 1 },
    });

    const fetchLists = useMemoizedFn((page?: number) => {
        if (getLoading()) return;

        setLoading(true);
        NetWorkApi<SearchPageMeta, API.MessageCenterCommentResponse>({
            method: "get",
            url: "/api/message/center/content",
            params: {
                page: page || listPage,
                limit: 10,
                order: "desc",
            },
            userToken: true,
        })
            .then((res) => {
                setLists({
                    data: lists.data.concat(res.data || []),
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 100));
    });

    const nextPage = useMemoizedFn((e: Event) => {
        if (getLoading()) return;
        if (lists.data.length === lists.pagemeta.total) return;

        if (e && e.target && (e.target as any).scrollingElement) {
            const scroll = (e.target as any).scrollingElement as HTMLElement;
            if (
                scroll.scrollTop + scroll.clientHeight >=
                scroll.scrollHeight - 100
            ) {
                const pages = listPage;
                setListPage(pages + 1);
                fetchLists(pages + 1);
            }
        }
    });
    useEffect(() => {
        document.addEventListener("scroll", nextPage);
        return () => {
            window.removeEventListener("scroll", nextPage);
        };
    }, []);

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
            {loading && <div className="list-loading">正在加载中。。。</div>}
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
    const imgs: string[] =
        !info.dynamic_content_img || info.dynamic_content_img === "null"
            ? undefined
            : JSON.parse(info.dynamic_content_img);

    const router = useRouter();

    const [replyShow, setReplyShow] = useState<boolean>(false);

    const [starsLoading, setStarLoading, getStarLoading] =
        useGetState<boolean>(false);
    const [starShow, setStarShow] = useState<boolean>(false);
    const onStar = useMemoizedFn(() => {
        if (getStarLoading()) return;

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
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setStarLoading(false), 100));
    });

    return (
        <div className="comment-message-wrapper">
            <div className="comment-message-reply">
                <div className="reply-img">
                    <img
                        src={info.head_img}
                        className="img-style"
                        onClick={() =>
                            router.push(`/userpage?user=${info.user_id}`)
                        }
                    />
                </div>

                <div className="reply-content">
                    <div
                        className="reply-name text-ellipsis-style"
                        onClick={() =>
                            router.push(`/userpage?user=${info.user_id}`)
                        }
                    >
                        {info.user_name}
                    </div>
                    <div className="reply-body">
                        {!!info.root_id && (
                            <>
                                {"回复"}
                                <span>{`@${info.by_user_name}`}</span>
                                {": "}
                            </>
                        )}
                        {info.message}
                    </div>
                    <div className="reply-time">
                        {timeFormat(info.created_at, "YYYY/MM/DD HH:mm")}
                    </div>
                </div>
            </div>

            {!info.root_id && (
                <div className="comment-message-dynamic">
                    {imgs.length === 0 && !info.dynamic_cover && (
                        <div className="dynamic-wrapper">
                            <div className="dynamic-name text-ellipsis-style">
                                {`@${info.dynamic_user_name}`}
                            </div>

                            <div className="dynamic-content">
                                {info.dynamic_content}
                            </div>
                        </div>
                    )}

                    {imgs.length > 0 && (
                        <div className="dynamic-img-wrapper">
                            <div className="dynamic-img">
                                <img src={imgs[0]} className="img-style" />
                            </div>
                            <div className="dynamic-content">
                                <div className="dynamic-name text-ellipsis-style">
                                    {`@${info.dynamic_user_name}`}
                                </div>

                                <div className="dynamic-text">
                                    {info.dynamic_content}
                                </div>
                            </div>
                        </div>
                    )}

                    {!!info.dynamic_cover && (
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
                                    {info.dynamic_title}
                                </div>

                                <div className="dynamic-text text-ellipsis-style">
                                    {info.dynamic_content}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!!info.root_id && (
                <div className="comment-message-dynamic-reply">
                    <div className="dynamic-reply-content">
                        <span
                            onClick={() =>
                                router.push({
                                    pathname: "/userinfo",
                                    query: { tabs: "dynamic" },
                                })
                            }
                        >{`@${info.by_user_name}`}</span>
                        {`: ${info.by_message}`}
                    </div>

                    {imgs.length === 0 && !info.dynamic_cover && (
                        <div className="dynamic-wrapper">
                            <div className="dynamic-name text-ellipsis-style">
                                {`@${info.dynamic_user_name}`}
                            </div>

                            <div className="dynamic-content">
                                {info.dynamic_content}
                            </div>
                        </div>
                    )}
                    {imgs.length > 0 && (
                        <div className="dynamic-img-wrapper">
                            <div className="dynamic-img">
                                <img src={imgs[0]} className="img-style" />
                            </div>
                            <div className="dynamic-content">
                                <div className="dynamic-name text-ellipsis-style">
                                    {`@${info.dynamic_user_name}`}
                                </div>

                                <div className="dynamic-text">
                                    {info.dynamic_content}
                                </div>
                            </div>
                        </div>
                    )}
                    {!!info.dynamic_cover && (
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
                                    {info.dynamic_title}
                                </div>

                                <div className="dynamic-text text-ellipsis-style">
                                    {info.dynamic_content}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                        disabled={starsLoading}
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
                mainCommentId={info.root_id}
                commentId={info.id}
                commentUserId={info.user_id}
                name={info.user_name}
                visible={replyShow}
                onCancel={() => setReplyShow(false)}
            />
        </div>
    );
};
