import React, { useRef, useState } from "react";
import { NextPage } from "next";
import { Button, Form, Input, Modal, Popover, Progress, Switch } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import {
    TopicIcon,
    TopicThemeIcon,
    UploadImgIcon,
    UploadImgThemeIcon,
    UploadVideoIcon,
    UploadVideoThemeIcon,
} from "../../public/icons";
import SecondConfirm from "./SecondConfirm";

const { TextArea } = Input;
const { Item } = Form;

interface PostCommentProps {
    visible: boolean;
    onCancel: (flag: boolean) => any;
}

const PostComment: NextPage<PostCommentProps> = (props) => {
    const { visible, onCancel } = props;

    const [secondShow, setSecondShow] = useState<boolean>(false);

    const [imgIcon, setImgIcon] = useState<boolean>(false);
    const [videoIcon, setVideoIcon] = useState<boolean>(false);
    const [topicIcon, setTopicIcon] = useState<boolean>(false);
    const [topicShow, setTopicShow] = useState<boolean>(false);

    return (
        <Modal
            visible={visible}
            centered={true}
            closable={false}
            footer={null}
            destroyOnClose={true}
            className="post-comment-modal"
            onCancel={() => setSecondShow(true)}
        >
            <div className="post-comment-body">
                <div className="post-comment-header">
                    <div className="header-title">发布动态</div>
                    <CloseOutlined className="header-del" />
                </div>

                <TextArea
                    className="post-comment-input"
                    placeholder="有什么想分享给大家～"
                    autoSize={{ minRows: 4, maxRows: 6 }}
                />

                <div className="post-comment-operate">
                    <div className="operate-function">
                        <Button
                            type="link"
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
                        <Button
                            type="link"
                            onMouseEnter={() => setVideoIcon(true)}
                            onMouseLeave={() => setVideoIcon(false)}
                            disabled={true}
                            icon={
                                videoIcon ? (
                                    <UploadVideoThemeIcon className="icon-style" />
                                ) : (
                                    <UploadVideoIcon className="icon-style" />
                                )
                            }
                        />

                        <Popover
                            overlayClassName="topic-add-list"
                            trigger="click"
                            placement="bottomLeft"
                            visible={topicShow}
                            onVisibleChange={setTopicShow}
                            content={
                                <div className="topic-add-list-body">
                                    <div className="body-title">添加话题</div>
                                    <Input
                                        className="body-input"
                                        placeholder="请输入话题内容"
                                    />
                                    <div className="body-list">
                                        {[
                                            "可爱禁止令",
                                            "成都太古里 防疫",
                                            "happy818gday",
                                            "权志龙 0818 生日快乐",
                                            "抗疫守护计划",
                                        ].map((item, index) => {
                                            return (
                                                <div className="list-opt text-ellipsis-style">{`#${item}#`}</div>
                                            );
                                        })}
                                    </div>
                                </div>
                            }
                        >
                            <Button
                                type="link"
                                onMouseEnter={() => setTopicIcon(true)}
                                onMouseLeave={() => setTopicIcon(false)}
                                icon={
                                    topicIcon ? (
                                        <TopicThemeIcon className="icon-style" />
                                    ) : (
                                        <TopicIcon className="icon-style" />
                                    )
                                }
                            />
                        </Popover>
                    </div>

                    <div className="operate-publish">
                        <Button className="operate-publish-btn">发布</Button>
                    </div>
                </div>

                {false && (
                    <div className="post-comment-img">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item, idnex) => {
                            return (
                                <div className="img-opt">
                                    <img
                                        src="https://img2.baidu.com/it/u=586743041,2475093996&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500"
                                        className="img-style"
                                    />
                                    <div className="img-opt-del">x</div>
                                </div>
                            );
                        })}
                        <div className="img-add">
                            <PlusOutlined className="icon-style" />
                        </div>
                    </div>
                )}

                <div className="post-comment-video">
                    <div className="video-hint">
                        请上传 200MB 以下的视频，请勿上传色情、反动等违法视频
                    </div>

                    <div className="video-progress">
                        <Progress
                            className="video-progress-style"
                            percent={50}
                            showInfo={false}
                            strokeColor="#ff7d23"
                        />
                        {true ? (
                            <a href="#" className="video-cancel">
                                取消上传
                            </a>
                        ) : (
                            <div className="video-operate">
                                <a
                                    href="#"
                                    className="text-style video-replace"
                                >
                                    替换
                                </a>
                                <a href="#" className="text-style video-del">
                                    删除
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="video-progress-info">
                        <span>已上传55%</span>
                        <span>32.56MB / 59MB</span>
                    </div>

                    <Form
                        className="video-form"
                        size="small"
                        colon={false}
                        labelCol={{ span: 3 }}
                        labelAlign="left"
                    >
                        <Item label="标题">
                            <Input
                                placeholder="请输入中文、英文或数字，不超过50个字符"
                                className="video-form-input"
                            />
                        </Item>

                        <Item label="封面">
                            <Input placeholder="请输入中文、英文或数字，不超过50个字符" />
                        </Item>

                        <Item label="允许下载">
                            <Switch />
                        </Item>
                    </Form>
                </div>

                <SecondConfirm
                    visible={secondShow}
                    onCancel={(flag) => {
                        setSecondShow(false);
                        if (flag)
                            setTimeout(() => {
                                onCancel(false);
                            }, 50);
                    }}
                />
            </div>
        </Modal>
    );
};

export default PostComment;
