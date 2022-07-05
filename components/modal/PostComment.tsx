import React, { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import {
    Button,
    Form,
    Input,
    Modal,
    Popover,
    Progress,
    Switch,
    Upload,
} from "antd";
import { CloseOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import {
    TopicIcon,
    TopicThemeIcon,
    UploadImgIcon,
    UploadImgThemeIcon,
    UploadVideoIcon,
    UploadVideoThemeIcon,
} from "../../public/icons";
import SecondConfirm from "./SecondConfirm";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { InputTheme } from "../baseComponents/InputTheme";
import { useDebounce, useMemoizedFn } from "ahooks";
import InfoConfirm from "./InfoConfirm";
import { RcFile } from "antd/lib/upload";
import { failed } from "../../utils/notification";

const { TextArea } = Input;
const { Item } = Form;

interface PostCommentProps {
    visible: boolean;
    onCancel: (flag: boolean) => any;
}

interface FetchTopicProps {
    keywords: string;
}

interface NewDynamicInfoProps {
    content: string;
    content_img: string[];
    content_video: string[];
    topics: API.TopicList[];
    title: string;
    cover: string;
    download: boolean;
}

const PostComment: NextPage<PostCommentProps> = (props) => {
    const { visible, onCancel } = props;

    const [dynamic, setDynamic] = useState<NewDynamicInfoProps>({
        content: "",
        content_img: [],
        content_video: [],
        topics: [],
        title: "",
        cover: "",
        download: false,
    });

    const [secondShow, setSecondShow] = useState<boolean>(false);
    // 图片文件规则判断
    const imgJudge = (file: RcFile) => {
        if (file.size > 10 * 1024 * 1024) {
            failed("请上传10MB以内的图片");
            return false;
        }
        if (!["image/jpg", "image/jpeg", "image/png"].includes(file.type)) {
            failed("请上传10MB以内的图片");
            return false;
        }
        return true;
    };

    const [imgIcon, setImgIcon] = useState<boolean>(false);
    const imgTime = useRef<any>(null);
    const fileList = useRef<RcFile[]>([]);
    const imgList = useRef<string[]>([]);

    const uploadImg = useMemoizedFn(() => {
        if (fileList.current.length === 0) return;
        // @ts-ignore
        const file: RcFile = fileList.current.pop();
        var formData = new FormData();
        formData.append("file_name", file);
        formData.append("type", file.type);
        return NetWorkApi<FormData, string>({
            method: "post",
            url: "/api/upload/img",
            data: formData,
            userToken: true,
        })
            .then((res) => {
                console.log([res]);
                setTimeout(() => {
                    uploadImg();
                }, 1000);
            })
            .catch((err) => {
                uploadImg();
            });
    });

    const [videoIcon, setVideoIcon] = useState<boolean>(false);
    const videoTime = useRef<any>(null);
    const videoCount = useRef<number>(0);
    const [videoRate, setVideoRate] = useState<number>(0);
    const [videoSize, setVideoSize] = useState<number>(0);

    const [coverMak, setCoverMask] = useState<boolean>(false);

    const [uploadWarn, setUploadWarn] = useState<boolean>(false);
    const [uploadWarnType, setUploadWarnType] = useState<1 | 2>(1);

    const showUploadWarn = (flag: 1 | 2) => {
        setUploadWarnType(flag);
        setUploadWarn(true);
    };
    const callbackUploadWarn = useMemoizedFn((flag: boolean) => {
        if (flag) {
            setDynamic({
                ...dynamic,
                content_img: uploadWarnType === 2 ? [] : dynamic.content_img,
                content_video:
                    uploadWarnType === 1 ? [] : dynamic.content_video,
                title: uploadWarnType === 1 ? "" : dynamic.title,
                cover: uploadWarnType === 1 ? "" : dynamic.cover,
            });
            setUploadWarn(false);
        } else {
            setUploadWarn(false);
        }
    });

    const [topicIcon, setTopicIcon] = useState<boolean>(false);
    const [topicShow, setTopicShow] = useState<boolean>(false);
    const [topicList, setTopiCList] = useState<API.TopicList[]>([]);
    const [topicSearch, setTopicSearch] = useState<string>("");

    const fetchTopic = () => {
        NetWorkApi<FetchTopicProps, API.TopicSearchResponse>({
            method: "get",
            url: "/api/forum/topics",
            params: { keywords: topicSearch || "all" },
            userToken: true,
        })
            .then((res) => {
                setTopiCList(res.data || []);
            })
            .catch((err) => {});
    };

    useEffect(() => {
        fetchTopic();
    }, [useDebounce(topicSearch, { wait: 500 })]);

    const selectTopic = useMemoizedFn((item: API.TopicList) => {
        setDynamic({
            ...dynamic,
            content: `${dynamic.content}#${item.topics}#`,
            topics: dynamic.topics.concat([item]),
        });
    });

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
                    value={dynamic.content}
                    onChange={(e) =>
                        setDynamic({ ...dynamic, content: e.target.value })
                    }
                />

                <div className="post-comment-operate">
                    <div className="operate-function">
                        {dynamic.content_video.length === 1 ? (
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
                                onClick={() => showUploadWarn(1)}
                            />
                        ) : (
                            <Upload
                                accept=".png,.jpg,.jpeg"
                                showUploadList={false}
                                multiple={true}
                                beforeUpload={(file: RcFile) => {
                                    if (!imgJudge(file)) {
                                        return Promise.reject();
                                    }
                                    console.log(file);

                                    fileList.current.push(file);

                                    if (imgTime.current) {
                                        clearTimeout(imgTime.current);
                                        imgTime.current = null;
                                    }
                                    imgTime.current = setTimeout(
                                        () => uploadImg(),
                                        200
                                    );
                                    return Promise.reject();
                                }}
                            >
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
                            </Upload>
                        )}
                        {dynamic.content_img.length !== 0 ? (
                            <Button
                                type="link"
                                onMouseEnter={() => setVideoIcon(true)}
                                onMouseLeave={() => setVideoIcon(false)}
                                icon={
                                    videoIcon ? (
                                        <UploadVideoThemeIcon className="icon-style" />
                                    ) : (
                                        <UploadVideoIcon className="icon-style" />
                                    )
                                }
                                onClick={() => showUploadWarn(2)}
                            />
                        ) : (
                            <Upload
                                accept=".mp4"
                                showUploadList={false}
                                beforeUpload={(file: RcFile) => {
                                    if (file.size > 200 * 1024 * 1024) {
                                        failed("请上传200MB以内的视频");
                                        return Promise.reject();
                                    }
                                    if (file.type !== "video/mp4") {
                                        failed("请上传MP4格式的视频");
                                        return Promise.reject();
                                    }
                                    setDynamic({
                                        ...dynamic,
                                        content_video: ["123"],
                                        title: "未命名视频",
                                    });
                                    setVideoSize(file.size);

                                    if (videoTime.current) {
                                        clearInterval(videoTime.current);
                                        videoTime.current = null;
                                    }
                                    videoTime.current = setInterval(() => {
                                        if (videoCount.current === 11) {
                                            clearInterval(videoTime.current);
                                            videoTime.current = null;
                                            return;
                                        }
                                        videoCount.current =
                                            videoCount.current + 1;
                                        setVideoRate(videoCount.current * 9);
                                    }, 1000);

                                    // var formData = new FormData();
                                    // formData.append("file_name", file);
                                    // formData.append("type", file.type);
                                    // NetWorkApi<FormData, string>({
                                    //     method: "post",
                                    //     url: "/api/upload/video",
                                    //     data: formData,
                                    //     userToken: true,
                                    // })
                                    //     .then((res) => {
                                    //         clearInterval(videoTime.current);
                                    //         videoTime.current = null;
                                    //         videoCount.current = 0;
                                    //         setVideoRate(100);

                                    //         setDynamic({
                                    //             ...dynamic,
                                    //             content_video: [res],
                                    //             title:
                                    //                 file.name.split(".")[0] ||
                                    //                 "未命名视频",
                                    //         });
                                    //     })
                                    //     .catch((err) => {});

                                    return Promise.reject();
                                }}
                            >
                                <Button
                                    type="link"
                                    onMouseEnter={() => setVideoIcon(true)}
                                    onMouseLeave={() => setVideoIcon(false)}
                                    icon={
                                        videoIcon ? (
                                            <UploadVideoThemeIcon className="icon-style" />
                                        ) : (
                                            <UploadVideoIcon className="icon-style" />
                                        )
                                    }
                                />
                            </Upload>
                        )}

                        <Popover
                            overlayClassName="topic-add-list"
                            trigger="click"
                            placement="bottomLeft"
                            visible={topicShow}
                            onVisibleChange={setTopicShow}
                            content={
                                <div className="topic-add-list-body">
                                    <div className="body-title">添加话题</div>
                                    <InputTheme
                                        isTheme={false}
                                        isInfo={true}
                                        className="body-input"
                                        placeholder="请输入话题内容"
                                        value={topicSearch}
                                        onChange={(e) =>
                                            setTopicSearch(e.target.value)
                                        }
                                    />
                                    <div className="body-list">
                                        {topicSearch
                                            ? [
                                                  {
                                                      id: 0,
                                                      created_at: 0,
                                                      updated_at: 0,
                                                      topics: topicSearch,
                                                      hot_num: 0,
                                                  } as API.TopicList,
                                              ]
                                                  .concat(topicList)
                                                  .map((item, index) => {
                                                      return (
                                                          <div
                                                              className="list-opt text-ellipsis-style"
                                                              onClick={() =>
                                                                  selectTopic(
                                                                      item
                                                                  )
                                                              }
                                                          >{`#${item.topics}#`}</div>
                                                      );
                                                  })
                                            : topicList.map((item, index) => {
                                                  return (
                                                      <div
                                                          className="list-opt text-ellipsis-style"
                                                          onClick={() =>
                                                              selectTopic(item)
                                                          }
                                                      >{`#${item.topics}#`}</div>
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

                {dynamic.content_img.length !== 0 && (
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

                {dynamic.content_video.length === 1 && (
                    <div className="post-comment-video">
                        <div className="video-hint">
                            请上传 200MB
                            以下的视频，请勿上传色情、反动等违法视频
                        </div>

                        <div className="video-progress">
                            <Progress
                                className="video-progress-style"
                                percent={videoRate}
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
                                    <a
                                        href="#"
                                        className="text-style video-del"
                                    >
                                        删除
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="video-progress-info">
                            <span>{`已上传${videoRate}%`}</span>
                            <span>{`${(
                                (videoSize * videoRate) /
                                100 /
                                1024 /
                                1024
                            ).toFixed(2)}MB / ${(
                                videoSize /
                                1024 /
                                1024
                            ).toFixed(2)}MB`}</span>
                        </div>

                        <Form
                            className="video-form"
                            size="small"
                            colon={false}
                            labelCol={{ span: 3 }}
                            labelAlign="left"
                        >
                            <Item label="标题">
                                <InputTheme
                                    isTheme={false}
                                    isInfo={true}
                                    placeholder="请输入中文、英文或数字，不超过50个字符"
                                    className="video-form-input"
                                    value={dynamic.title}
                                    onChange={(e) =>
                                        setDynamic({
                                            ...dynamic,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </Item>

                            <Item label="封面">
                                {dynamic.cover ? (
                                    <div
                                        className="video-cover-body"
                                        onMouseEnter={() => setCoverMask(true)}
                                        onMouseLeave={() => setCoverMask(false)}
                                    >
                                        <img
                                            src={dynamic.cover}
                                            className="img-style"
                                        />
                                        <div
                                            className={`mask-cover ${
                                                coverMak
                                                    ? "mask-cover-background"
                                                    : ""
                                            }`}
                                        >
                                            <Upload
                                                accept=".png,.jpg,.jpeg"
                                                showUploadList={false}
                                                beforeUpload={(
                                                    file: RcFile
                                                ) => {
                                                    if (!imgJudge(file)) {
                                                        return Promise.reject();
                                                    }

                                                    setDynamic({
                                                        ...dynamic,
                                                        cover: "https://cdn.wwads.cn/creatives/ra3JWw2BUzryn8z9YO2LZsvyimQMECGt8AqFT9QL.jpg",
                                                    });

                                                    // var formData = new FormData();
                                                    // formData.append("file_name", file);
                                                    // formData.append("type", file.type);
                                                    // NetWorkApi<FormData, string>({
                                                    //     method: "post",
                                                    //     url: "/api/upload/img",
                                                    //     data: formData,
                                                    //     userToken: true,
                                                    // })
                                                    //     .then((res) => {
                                                    //         setDynamic({
                                                    //             ...dynamic,
                                                    //             cover: res,
                                                    //         });
                                                    //     })
                                                    //     .catch((err) => {});

                                                    return Promise.reject();
                                                }}
                                            >
                                                {coverMak && (
                                                    <div className="cover-btn">
                                                        替换封面
                                                    </div>
                                                )}
                                            </Upload>
                                            {coverMak && (
                                                <div className="cover-btn">
                                                    裁剪封面
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <Upload
                                        accept=".png,.jpg,.jpeg"
                                        showUploadList={false}
                                        beforeUpload={(file: RcFile) => {
                                            if (!imgJudge(file)) {
                                                return Promise.reject();
                                            }

                                            setDynamic({
                                                ...dynamic,
                                                cover: "https://cdn.wwads.cn/creatives/ra3JWw2BUzryn8z9YO2LZsvyimQMECGt8AqFT9QL.jpg",
                                            });

                                            // var formData = new FormData();
                                            // formData.append("file_name", file);
                                            // formData.append("type", file.type);
                                            // NetWorkApi<FormData, string>({
                                            //     method: "post",
                                            //     url: "/api/upload/img",
                                            //     data: formData,
                                            //     userToken: true,
                                            // })
                                            //     .then((res) => {
                                            //         setDynamic({
                                            //             ...dynamic,
                                            //             cover: res,
                                            //         });
                                            //     })
                                            //     .catch((err) => {});

                                            return Promise.reject();
                                        }}
                                    >
                                        <div className="video-cover-body">
                                            <UploadOutlined className="icon-style" />
                                            <div className="text-style">
                                                设置视频封面
                                            </div>
                                        </div>
                                    </Upload>
                                )}
                            </Item>

                            <Item label="允许下载">
                                <Switch
                                    checked={dynamic.download}
                                    onChange={(checked) =>
                                        setDynamic({
                                            ...dynamic,
                                            download: checked,
                                        })
                                    }
                                />
                            </Item>
                        </Form>
                    </div>
                )}

                <SecondConfirm
                    visible={secondShow}
                    onCancel={(flag) => {
                        setSecondShow(false);
                        if (flag) setTimeout(() => onCancel(false), 50);
                    }}
                />

                <InfoConfirm
                    visible={uploadWarn}
                    title={`确定要放弃已上传的${
                        uploadWarnType === 1 ? "视频" : "图片"
                    }吗？`}
                    content={"视频和图片不可同时上传"}
                    onCancel={() => callbackUploadWarn(false)}
                    onSubmit={() => callbackUploadWarn(true)}
                />
            </div>
        </Modal>
    );
};

export default PostComment;
