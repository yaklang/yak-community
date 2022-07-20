import React, { useEffect, useState } from "react";
import { useMemoizedFn } from "ahooks";
import {} from "antd";
import { CaretDownOutlined } from "@ant-design/icons";
import { NetWorkApi } from "../utils/fetch";
import { API } from "../types/api";
import { StarsComment } from "../types/extraApi";
import { CollapseParagraph } from "./baseComponents/CollapseParagraph";
import { timeFormat } from "../utils/timeTool";
import { LikeIcon, LikeThemeIcon, ReplyIcon } from "../public/icons";
import SubComment from "./modal/SubComment";

export interface CommentContentInfoProps {
    dynamicInfo?: API.DynamicLists;
    info: API.DynamicCommentList;
    onReply: (item: API.DynamicCommentList) => any;
    isShowMore?: boolean;
    isSubComment?: boolean;

    signCommentId?: number;
    updateCommentStar?: (id: number, isStar: boolean) => any;
    updateCommentNum?: (id: number) => any;
}

export const CommentContentInfo: React.FC<CommentContentInfoProps> = (
    props
) => {
    const {
        dynamicInfo,
        info,
        onReply,
        isShowMore = true,
        isSubComment = false,
        signCommentId,
        updateCommentStar,
        updateCommentNum,
    } = props;
    const imgs: string[] =
        info.message_img && info.message_img !== "null"
            ? JSON.parse(info.message_img)
            : [];

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
                if (updateCommentStar) updateCommentStar(info.id, flag);
                setFlag(!flag);
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 100));
    });

    const [moreShow, setMoreShow] = useState<boolean>(false);

    useEffect(() => {
        if (signCommentId === info.id) setFlag(!flag);
    }, [signCommentId]);

    return (
        <div
            className={`${
                isShowMore
                    ? "comment-content-info-wrapper"
                    : isSubComment
                    ? "sub-comment-content-info-wrapper"
                    : "comment-more-content-info-wrapper"
            }`}
        >
            <div className="comment-content-info-body">
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
                                {/* {info.reply_num} */}
                            </div>
                            <div className="operation-btn" onClick={onLike}>
                                {flag ? (
                                    <LikeThemeIcon className="icon-style" />
                                ) : (
                                    <LikeIcon className="icon-style" />
                                )}
                                {info.like_num}
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
            {dynamicInfo && isShowMore && (
                <SubComment
                    dynamicInfo={dynamicInfo}
                    info={info}
                    visible={moreShow}
                    onCancel={() => setMoreShow(false)}
                    updateCommentStar={(id, isStar) => {
                        if (updateCommentStar) updateCommentStar(id, isStar);
                    }}
                    updateCommentNum={(id) => {
                        if (updateCommentNum) updateCommentNum(id);
                    }}
                />
            )}
        </div>
    );
};
