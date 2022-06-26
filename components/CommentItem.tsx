import React, { useRef, useState } from "react";
import { NextPage } from "next";
import { Button, Col, Input, Row } from "antd";
import {
    CaretRightOutlined,
    CaretDownOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {
    CollectionIcon,
    LikeIcon,
    ReplyIcon,
    ReplyThemeIcon,
    UploadImgIcon,
} from "../public/icons";
import { CollapseParagraph } from "./baseComponents/CollapseParagraph";
import PostComment from "./modal/PostComment";
import SecondConfirm from "./modal/SecondConfirm";
import ImgCropper from "./modal/ImgCropper";
import { url } from "inspector";

const { TextArea } = Input;

interface CommentItemProps {}

const CommentItem: NextPage<CommentItemProps> = (props) => {
    const [showComment, setShowComment] = useState<boolean>(false);

    const [comment, setComment] = useState<string>("");

    return (
        <div className="comment-item-wrapper">
            <div className="comment-item-body">
                <div className="item-left-body">
                    <div className="body-img">
                        <img
                            src="/images/user/telephone.png"
                            className="img-style"
                        />
                    </div>
                </div>

                <div className="item-right-body">
                    <div className="body-avatar">
                        <div className="avatar-info">
                            <div className="avatar-info-name">TimWhite</div>
                            <div className="avatar-info-time">3-19 13:20</div>
                        </div>
                        <div className="avatar-follow">
                            <Button className="avatar-follow-btn">关注</Button>
                        </div>
                    </div>

                    <div className="body-container">
                        <div className="body-comment">
                            <CommentImg />
                        </div>

                        <div className="body-operation">
                            <Row>
                                <Col span={8}>
                                    <div className="body-operation-btn">
                                        <CollectionIcon className="icon-style" />
                                        <span
                                            onClick={(e) => e.stopPropagation()}
                                            className={
                                                showComment
                                                    ? "text-active"
                                                    : "text-normal"
                                            }
                                        >
                                            123
                                        </span>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div
                                        className="body-operation-btn"
                                        onClick={() =>
                                            setShowComment(!showComment)
                                        }
                                    >
                                        {showComment ? (
                                            <ReplyThemeIcon className="icon-style" />
                                        ) : (
                                            <ReplyIcon className="icon-style" />
                                        )}
                                        <span
                                            onClick={(e) => e.stopPropagation()}
                                            className={
                                                showComment
                                                    ? "text-active"
                                                    : "text-normal"
                                            }
                                        >
                                            123
                                        </span>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className="body-operation-btn">
                                        <LikeIcon className="icon-style" />
                                        <span
                                            onClick={(e) => e.stopPropagation()}
                                            className={
                                                showComment
                                                    ? "text-active"
                                                    : "text-normal"
                                            }
                                        >
                                            123
                                        </span>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>

            {showComment && (
                <div className="comment-item-reply">
                    <div className="comment-input-container">
                        <TextArea
                            value={comment}
                            placeholder="发布评论"
                            className="reply-input"
                            autoSize={{ minRows: 1, maxRows: 6 }}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <div className="reply-img-and-btn">
                            <div className="reply-img">
                                {[1, 2].map((item, index) => {
                                    return (
                                        <div className="reply-img-opt">
                                            <img
                                                src={`https://t12.baidu.com/it/u=3376231878,176147949&fm=30&app=106&f=JPEG?w=312&h=208&s=AA5210C7024E4555DC8CDCBB03005001`}
                                                className="img-style"
                                            />
                                            <div className="img-opt-del">x</div>
                                        </div>
                                    );
                                })}
                                {
                                    <div className="reply-img-add">
                                        <PlusOutlined className="icon-style" />
                                    </div>
                                }
                            </div>

                            <div className="reply-btn">
                                <Button
                                    className="reply-btn-style"
                                    type="link"
                                    icon={
                                        <UploadImgIcon className="icon-style" />
                                    }
                                />

                                <Button
                                    type="link"
                                    className="reply-btn-style img-btn-style"
                                >
                                    <img
                                        src={`${
                                            comment
                                                ? "/images/btn/sendCommentTheme.png"
                                                : "/images/btn/sendComment.png"
                                        }`}
                                        className="img-style"
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="comment-content-container">
                        {[1, 2, 3].map((item, index) => {
                            return <CommentContent key={index} />;
                        })}
                    </div>
                </div>
            )}

            <ImgCropper
                visible={showComment}
                onCancel={() => setShowComment(false)}
            />
        </div>
    );
};

export default CommentItem;

// 动态文字组件
interface CommentWordProp {}
const CommentWord: React.FC<CommentWordProp> = (props) => {
    return (
        <div className="comment-word-wrapper">
            <CollapseParagraph
                value={
                    "女孩子对白色没有抵抗力的，Poke4S阅读器的配置还是比较良心的，之前还担心配置不能满足我看漫画的需求，现在用过之后我的担心是多余的，看书、看绘本这些完全没有问题，还是开放系统，颜值很高，比我之前的封闭系统的Kindle好多.女孩子对白色没有抵抗力的，Poke4S阅读器的配置还是比较良心的，之前还担心配置不能满足我看漫画的需求，现在用过之后我的担心是多余的，看书、看绘本这些完全没有问题，还是开放系统，颜值很高，比我之前的封闭系统的Kindle好多了…"
                }
                topic="话题"
                rows={3}
            />
        </div>
    );
};
// 动态图片组件
interface CommentImgProp {}
const CommentImg: React.FC<CommentImgProp> = (props) => {
    const arrs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <div className="comment-img-wrapper">
            <CollapseParagraph
                value={
                    "女孩子对白色没有抵抗力的，Poke4S阅读器的配置还是比较良心的，之前还担心配置不能满足我看漫画的需求，现在用过之后我的担心是多余的，看书、看绘本这些完全没有问题，还是开放系统，颜值很高，比我之前的封闭系统的Kindle好多.女孩子对白色没有抵抗力的，Poke4S阅读器的配置还是比较良心的，之前还担心配置不能满足我看漫画的需求，现在用过之后我的担心是多余的，看书、看绘本这些完全没有问题，还是开放系统，颜值很高，比我之前的封闭系统的Kindle好多了…"
                }
                topic="话题"
                rows={3}
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
interface CommentVideoProp {}
const CommentVideo: React.FC<CommentVideoProp> = (props) => {
    return (
        <div className="comment-video-wrapper">
            <CollapseParagraph
                value={
                    "女孩子对白色没有抵抗力的，Poke4S阅读器的配置还是比较良心的，之前还担心配置不能满足我看漫画的需求，现在用过之后我的担心是多余的，看书、看绘本这些完全没有问题，还是开放系统，颜值很高，比我之前的封闭系统的Kindle好多.女孩子对白色没有抵抗力的，Poke4S阅读器的配置还是比较良心的，之前还担心配置不能满足我看漫画的需求，现在用过之后我的担心是多余的，看书、看绘本这些完全没有问题，还是开放系统，颜值很高，比我之前的封闭系统的Kindle好多了…"
                }
                topic="话题"
                isTopicLine={true}
                rows={3}
            />
            <div className="comment-video-body">
                <img
                    src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fm00%2Fe7%2Ff5%2F4be82635b9cf81ffdc1dd0e0f0204b51.jpg&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1658389880&t=214ecc64fa096ade8404bd642578664b"
                    className="img-style"
                />
                <div className="comment-video-mask">
                    <CaretRightOutlined className="icon-style" />
                </div>
            </div>
        </div>
    );
};

// 评论内容组件
interface CommentContentProp {}
const CommentContent: React.FC<CommentContentProp> = (props) => {
    return (
        <div className="comment-content-wrapper">
            <div className="comment-content-body">
                <div className="body-img">
                    <img
                        src="/images/user/telephone.png"
                        className="img-style"
                    />
                </div>

                <div className="body-data">
                    <div className="body-data-name text-ellipsis-style">
                        小李子
                    </div>

                    <div className="body-data-text">
                        <CollapseParagraph
                            value={
                                "女孩子对白色没有抵抗力的，\nPoke4S阅读器的配置还是比较良心的，\n\n 之前还担心配置不能满足我看漫画的需求，\n现在用过之后我的担心是多余的，\n看书、看绘本这些完全没有问题，还是开放系统，颜值很高，比我之前的封闭系统的Kindle好多.女孩子对白色没有抵抗力的，Poke4S阅读器的配置还是比较良心的，之前还担心配置不能满足我看漫画的需求，现在用过之后我的担心是多余的，看书、看绘本这些完全没有问题，还是开放系统，颜值很高，比我之前的封闭系统的Kindle好多了…"
                            }
                            rows={1}
                        />
                    </div>

                    <div className="body-data-time-operation">
                        <div className="body-data-time">2022/04/02 12:30</div>
                        <div className="body-data-operation">
                            <div className="operation-btn">
                                <ReplyIcon className="icon-style" />
                                68
                            </div>
                            <div className="operation-btn">
                                <LikeIcon className="icon-style" />
                                345
                            </div>
                        </div>
                    </div>

                    <div className="body-data-more">
                        共 68 条回复
                        <CaretDownOutlined className="icon-style" />
                    </div>
                </div>
            </div>
        </div>
    );
};
