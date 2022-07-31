import React, { useEffect, useState } from "react";
import { useMemoizedFn } from "ahooks";
import { CaretDownOutlined } from "@ant-design/icons";
import { NetWorkApi } from "../utils/fetch";
import { API } from "../types/api";
import { StarsComment } from "../types/extraApi";
import { timeFormat } from "../utils/timeTool";
import { LikeIcon, ReplyIcon } from "../public/icons";
import SubComment from "./modal/SubComment";
import { useRouter } from "next/router";
import { useStore } from "../store";
import { failed } from "../utils/notification";
import { CollapseText } from "./baseComponents/CollapseText";
import { ImgShow } from "./baseComponents/ImgShow";

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

    const router = useRouter();
    const { userInfo } = useStore();

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

    const judgeAuth = useMemoizedFn(() => {
        if (!userInfo.isLogin) {
            failed("请登录后重新操作");
            return false;
        }
        return true;
    });

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
                    <ImgShow
                        src={info.head_img}
                        onclick={() =>
                            router.push({
                                pathname: "/userpage",
                                query: { user: info.user_id },
                            })
                        }
                    />
                </div>

                <div className="body-data">
                    <div
                        className="body-data-name text-ellipsis-style"
                        onClick={() =>
                            router.push({
                                pathname: "/userpage",
                                query: { user: info.user_id },
                            })
                        }
                    >
                        {info.user_name}
                    </div>

                    <div className="body-data-text">
                        <CollapseText
                            value={
                                <>
                                    {isSubComment && (
                                        <>
                                            <span
                                                className="sub-comment-by-name"
                                                onClick={() =>
                                                    router.push(
                                                        `/userpage?user=${info.by_user_id}`
                                                    )
                                                }
                                            >{`@${info.by_user_name}`}</span>
                                            {": "}
                                        </>
                                    )}
                                    {info.message}
                                    {imgs.map((item) => {
                                        return (
                                            <a
                                                rel="noopener noreferrer"
                                                key={item}
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
                            isComment={true}
                        />
                    </div>

                    <div className="body-data-time-operation">
                        <div className="body-data-time">
                            {timeFormat(info.created_at, "YYYY/MM/DD HH:mm")}
                        </div>
                        <div className="body-data-operation">
                            <div
                                className="operation-btn"
                                onClick={() => {
                                    if (!judgeAuth()) return;
                                    onReply(info);
                                }}
                            >
                                <ReplyIcon className="icon-style" />
                                {/* {info.reply_num} */}
                            </div>
                            <div
                                className="operation-btn"
                                onClick={() => {
                                    if (!judgeAuth()) return;
                                    onLike();
                                }}
                            >
                                <LikeIcon
                                    className={`icon-style ${
                                        flag ? "icon-theme-style" : ""
                                    }`}
                                />

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
