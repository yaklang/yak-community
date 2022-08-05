import React, { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { Modal } from "antd";
import { API } from "../../types/api";
import { useGetState, useMemoizedFn, useVirtualList } from "ahooks";
import { NetWorkApi } from "../../utils/fetch";
import { FetchSubComments } from "../../types/extraApi";
import PostComment from "./PostComment";
import { CommentContentInfo } from "../CommentContentInfo";

interface SubCommentProps {
    dynamicInfo: API.DynamicLists;
    info: API.DynamicCommentList;
    width?: number;
    visible: boolean;
    onCancel: () => any;

    updateCommentStar?: (id: number, isStar: boolean) => any;
    updateCommentNum?: (id: number) => any;
}

const SubComment: NextPage<SubCommentProps> = (props) => {
    const {
        dynamicInfo,
        info,
        width,
        visible,
        onCancel,
        updateCommentStar,
        updateCommentNum,
    } = props;

    const [loading, setLoading, getLoading] = useGetState<boolean>(false);
    const pageRef = useRef<number>(1);
    const [lists, setLists] = useState<API.DynamicComment>({
        data: [],
        pagemeta: { page: 1, limit: 10, total: 12, total_page: 1 },
    });

    const listRef = useRef(null);
    const wrapperRef = useRef(null);

    const [list] = useVirtualList(lists.data, {
        containerTarget: listRef,
        wrapperTarget: wrapperRef,
        itemHeight: 100,
        overscan: 5,
    });

    const fetchSubCommentList = useMemoizedFn((isNew?: boolean) => {
        if (getLoading()) return;

        setLoading(true);
        NetWorkApi<FetchSubComments, API.DynamicComment>({
            method: "get",
            url: "/api/forum/comment/reply",
            params: {
                page: pageRef.current,
                limit: 10,
                order: "desc",
                root_id: info.id,
                dynamic_id: dynamicInfo.id,
            },
        })
            .then((res) => {
                if (isNew) {
                    setLists({
                        data: (res.data ? [res.data[0]] : []).concat(
                            lists.data
                        ),
                        pagemeta: res.pagemeta,
                    });
                } else {
                    setLists({
                        data: lists.data.concat(res.data || []),
                        pagemeta: res.pagemeta,
                    });
                }
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 300));
    });

    const moreList = useMemoizedFn((e) => {
        if (getLoading()) return;
        if (lists.data.length === lists.pagemeta.total) return;

        if (
            e.target.offsetHeight + e.target.scrollTop >
            e.target.scrollHeight - 30
        ) {
            pageRef.current += 1;
            fetchSubCommentList();
        }
    });

    useEffect(() => {
        if (visible) fetchSubCommentList();
    }, [visible]);

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
            destroyOnClose={true}
            className="sub-comment-modal"
            width={width || 662}
            title={`共 ${info.reply_num} 条回复`}
            visible={visible}
            onCancel={() => {
                setLists({
                    data: [],
                    pagemeta: { page: 1, limit: 10, total: 0, total_page: 1 },
                });
                pageRef.current = 1;
                onCancel();
            }}
        >
            <div className="sub-comment-wrapper">
                <div className="main-comment-body">
                    <CommentContentInfo
                        isShowMore={false}
                        info={info}
                        onReply={(commentInfo) => publishReply(commentInfo)}
                        updateCommentStar={(id, isStar) => {
                            if (updateCommentStar)
                                updateCommentStar(id, isStar);
                        }}
                    />
                </div>

                <div
                    ref={listRef}
                    className="sub-comment-body"
                    onScroll={(e) => moreList(e)}
                >
                    <div ref={wrapperRef}>
                        {list.map((item) => {
                            return (
                                <CommentContentInfo
                                    key={item.data.id}
                                    isShowMore={false}
                                    isSubComment={true}
                                    info={item.data}
                                    onReply={(commentInfo) =>
                                        publishReply(commentInfo)
                                    }
                                    updateCommentStar={(id, flag) => {
                                        setLists({
                                            data: lists.data.map((item) => {
                                                if (item.id === id) {
                                                    item.like_num = flag
                                                        ? item.like_num - 1
                                                        : item.like_num + 1;
                                                }
                                                return item;
                                            }),
                                            pagemeta: lists.pagemeta,
                                        });
                                    }}
                                />
                            );
                        })}
                    </div>

                    {loading && (
                        <div className="sub-comment-loading">正在加载中...</div>
                    )}
                </div>

                {replyComment && (
                    <PostComment
                        dynamicId={dynamicInfo.id}
                        mainCommentId={info.id}
                        commentId={replyComment.id}
                        commentUserId={replyComment.user_id}
                        name={replyComment.user_name}
                        visible={replyShow}
                        onCancel={(flag) => {
                            if (flag) {
                                fetchSubCommentList(true);
                                if (updateCommentNum) updateCommentNum(info.id);
                            }
                            setReplyShow(false);
                        }}
                    />
                )}
            </div>
        </Modal>
    );
};

export default SubComment;
