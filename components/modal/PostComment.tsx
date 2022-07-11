import React, { useState } from "react";
import { NextPage } from "next";
import { Button, Input, Modal } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { UploadImgIcon, UploadImgThemeIcon } from "../../public/icons";
import SecondConfirm from "./SecondConfirm";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { useMemoizedFn } from "ahooks";
import { failed } from "../../utils/notification";
import { SingleUpload } from "../baseComponents/SingleUpload";
import { ButtonTheme } from "../baseComponents/ButtonTheme";

const { TextArea } = Input;

const DefaultCommentInfo: API.NewDynamicComment = {
    dynamic_id: 0,
    message_img: [],
    parent_id: 0,
    by_user_id: 0,
    root_id: 0,
    message: "",
};

interface PostCommentProps {
    dynamicInfo: API.DynamicLists;
    mainCommentInfo?: API.DynamicCommentList;
    commentInfo: API.DynamicCommentList;
    visible: boolean;
    onCancel: (flag: boolean) => any;
}

const PostComment: NextPage<PostCommentProps> = (props) => {
    const { dynamicInfo, mainCommentInfo, commentInfo, visible, onCancel } =
        props;

    const [loading, setLoading] = useState<boolean>(false);
    const [comment, setComment] = useState<API.NewDynamicComment>({
        ...DefaultCommentInfo,
    });

    const releaseComment = useMemoizedFn(() => {
        if (!comment.message) {
            failed("请输入评论内容");
            return;
        }
        if (comment.message.length > 150) {
            failed("评论内容限制长度为150个字以内");
            return;
        }

        if (loading) return;

        let params: API.NewDynamicComment = {
            dynamic_id: dynamicInfo.id,
            parent_id: commentInfo.id,
            by_user_id: commentInfo.user_id,
            root_id: mainCommentInfo?.id || 0,
            message: comment.message,
        };
        if (comment.message_img && comment.message_img.length > 0)
            params.message_img = comment.message_img;

        setLoading(true);
        NetWorkApi<API.NewDynamicComment, API.ActionSucceeded>({
            method: "post",
            url: "/api/forum/comment",
            data: { ...params },
            userToken: true,
        })
            .then((res) => {
                setComment({ ...DefaultCommentInfo });
                onCancel(true);
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 300));
    });

    const [secondShow, setSecondShow] = useState<boolean>(false);

    const [imgIcon, setImgIcon] = useState<boolean>(false);

    const closeModal = useMemoizedFn(() => {
        if (
            comment.message ||
            (comment.message_img && comment.message_img.length !== 0)
        ) {
            setSecondShow(true);
        } else {
            onCancel(false);
        }
    });

    return (
        <Modal
            visible={visible}
            centered={true}
            closable={false}
            footer={null}
            destroyOnClose={true}
            className="post-comment-modal"
            onCancel={closeModal}
        >
            <div className="post-comment-body">
                <div className="post-comment-header">
                    <div className="header-title">{`回复@${
                        commentInfo.user_name || ""
                    }`}</div>
                    <CloseOutlined
                        className="header-del"
                        onClick={closeModal}
                    />
                </div>

                <TextArea
                    className="post-comment-input"
                    placeholder="请输入回复内容"
                    autoSize={{ minRows: 4, maxRows: 6 }}
                    value={comment.message}
                    onChange={(e) =>
                        setComment({ ...comment, message: e.target.value })
                    }
                />

                <div className="post-comment-operate">
                    <div className="operate-function">
                        <SingleUpload
                            setValue={(res) => {
                                setComment({
                                    ...comment,
                                    message_img: comment.message_img?.concat([
                                        res,
                                    ]),
                                });
                            }}
                        >
                            <Button
                                type="link"
                                disabled={comment.message_img?.length === 3}
                                onMouseEnter={() => setImgIcon(true)}
                                onMouseLeave={() => setImgIcon(false)}
                                icon={
                                    imgIcon ? (
                                        <UploadImgThemeIcon className="icon-style" />
                                    ) : (
                                        <UploadImgIcon className="icon-style" />
                                    )
                                }
                            />
                        </SingleUpload>
                    </div>

                    <div className="operate-publish">
                        <ButtonTheme
                            className={`operate-publish-btn ${
                                !comment.message ? "opacity-50" : ""
                            }`}
                            disabled={!comment.message}
                            onClick={releaseComment}
                        >
                            发布
                        </ButtonTheme>
                    </div>
                </div>

                {comment.message_img && comment.message_img.length > 0 && (
                    <div className="post-comment-img">
                        {comment.message_img.map((item, index) => {
                            return (
                                <div className="img-opt" key={index}>
                                    <img src={item} className="img-style" />
                                    <div
                                        className="img-opt-del"
                                        onClick={() => {
                                            if (!comment.message_img) return;
                                            const imgs = [
                                                ...comment.message_img,
                                            ];
                                            imgs.splice(index, 1);
                                            setComment({
                                                ...comment,
                                                message_img: imgs,
                                            });
                                        }}
                                    >
                                        x
                                    </div>
                                </div>
                            );
                        })}
                        {comment.message_img.length < 3 && (
                            <SingleUpload
                                setValue={(res) => {
                                    setComment({
                                        ...comment,
                                        message_img:
                                            comment.message_img?.concat([res]),
                                    });
                                }}
                            >
                                <div className="img-add">
                                    <PlusOutlined className="icon-style" />
                                </div>
                            </SingleUpload>
                        )}
                    </div>
                )}

                <SecondConfirm
                    visible={secondShow}
                    onCancel={(flag) => {
                        setSecondShow(false);
                        if (flag) {
                            setComment({ ...DefaultCommentInfo });
                            setTimeout(() => onCancel(false), 50);
                        }
                    }}
                />
            </div>
        </Modal>
    );
};

export default PostComment;
