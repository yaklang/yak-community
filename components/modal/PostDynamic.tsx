import React, { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import {
    Button,
    Form,
    Input,
    Modal,
    Popconfirm,
    Popover,
    Progress,
    Spin,
    Tooltip,
    Upload,
} from "antd";
import { CloseOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { TopicIcon, UploadImgIcon, UploadVideoIcon } from "../../public/icons";
import SecondConfirm from "./SecondConfirm";
import { NetWorkApi } from "../../utils/fetch";
import { API } from "../../types/api";
import { InputTheme } from "../baseComponents/InputTheme";
import { useDebounce, useGetState, useMemoizedFn } from "ahooks";
import InfoConfirm from "./InfoConfirm";
import { RcFile } from "antd/lib/upload";
import { failed } from "../../utils/notification";
import { imgJudge, SingleUpload } from "../baseComponents/SingleUpload";
import { useStore } from "../../store";
import { generateTimeName } from "../../utils/timeTool";
import { ImgShow } from "../baseComponents/ImgShow";

const { TextArea } = Input;
const { Item } = Form;

interface PostDynamicProps {
    existId?: number;
    visible: boolean;
    onCancel: (flag: boolean) => any;
}

interface FetchTopicProps {
    keywords: string;
}

interface NewDynamicInfoProps {
    content: string;
    content_img: { src: string; name: string }[];
    content_video: { src: string; name: string };
    topics: API.TopicList[];
    title: string;
    cover: string;
    download: boolean;
    csrf_token: string;
}

const DefaultNewDynamicInfo: NewDynamicInfoProps = {
    content: "",
    content_img: [],
    content_video: { src: "", name: "" },
    topics: [],
    title: "",
    cover: "",
    download: false,
    csrf_token: "",
};

const PostDynamic: NextPage<PostDynamicProps> = (props) => {
    const { existId, visible, onCancel } = props;

    const { userInfo, setHomePageDynamicId } = useStore();

    const isShow = useRef<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [dynamic, setDynamic, getDynamic] = useGetState<NewDynamicInfoProps>({
        ...DefaultNewDynamicInfo,
    });
    // 获取随机token标识
    const fetchCsrfToken = useMemoizedFn(() => {
        NetWorkApi<undefined, string>({
            method: "get",
            url: "/api/random",
            userToken: true,
        })
            .then((res) => {
                setDynamic({ ...getDynamic(), csrf_token: res });
            })
            .catch((err) => {});
    });
    useEffect(() => {
        if (visible) {
            isShow.current = true;
            fetchCsrfToken();
        }
    }, [visible]);

    useEffect(() => {
        if (existId) {
            NetWorkApi<{ id: number }, API.DynamicListDetailResponse>({
                method: "get",
                url: "/api/dynamic/detail",
                params: { id: existId },
                userToken: true,
            })
                .then((res) => {
                    const { data } = res;
                    const imgs: string[] =
                        !data.content_img || data.content_img === "null"
                            ? []
                            : JSON.parse(data.content_img);

                    setTimeout(() => {
                        setDynamic({
                            ...getDynamic(),
                            content: data.content,
                            content_img: imgs.map((item) => {
                                const imgInfo: { src: string; name: string } = {
                                    src: item,
                                    name: item.split("/").pop() || "",
                                };
                                return imgInfo;
                            }),
                            content_video: {
                                src: data.content_video,
                                name: data.content_video.split("/").pop() || "",
                            },
                            topics: data.topic_info
                                ? data.topic_info.map((item) => {
                                      const topicInfo: API.TopicList = {
                                          id: item.id,
                                          created_at: 0,
                                          updated_at: 0,
                                          topics: item.topics,
                                          hot_num: 0,
                                      };
                                      return topicInfo;
                                  })
                                : [],
                            title: data.title,
                            cover: data.cover,
                            download: data.download,
                        });
                    }, 50);
                })
                .catch((err) => {});
        }
    }, [existId]);

    const cancelModal = useMemoizedFn(() => {
        if (
            dynamic.content ||
            dynamic.content_img.length !== 0 ||
            dynamic.content_video.src ||
            dynamic.title ||
            dynamic.cover
        ) {
            setSecondShow(true);
        } else {
            isShow.current = false;
            setTimeout(() => onCancel(false), 50);
            resetDynamic();
        }
    });
    // 重置弹窗内数据
    const resetDynamic = () => {
        setLoading(false);
        setDynamic({ ...DefaultNewDynamicInfo });
        imgTime.current = null;
        fileList.current = [];
        imgList.current = [];
        videoTime.current = null;
        videoCount.current = 0;
        setVideoRate(0);
        setVideoSize(0);
        setTopiCList([]);
        setTopicSearch("");
    };

    const releaseDynamic = useMemoizedFn(() => {
        if (!userInfo.isLogin) {
            failed("请先登录账户后再使用");
            return;
        }

        if (!dynamic.content) {
            failed("请输入动态内容");
            return;
        }

        if (
            (dynamic.content_video.src && (!dynamic.cover || !dynamic.title)) ||
            (!dynamic.content_video.src && (dynamic.cover || dynamic.title))
        ) {
            failed("请完善视频相关内容填写");
            return;
        }

        setLoading(true);

        // 通过动态内容过滤后还存在的话题内容
        const existTopics = dynamic.topics.filter(
            (item) => dynamic.content.indexOf(item.topics) > -1
        );
        // 选择的话题ID
        const topic_id = existTopics
            .filter((item) => !!item.id)
            .map((item) => item.id);
        // 新建话题内容
        const topics = existTopics
            .filter((item) => !item.id)
            .map((item) => item.topics);

        const params: API.NewDynamic = {
            content: dynamic.content,
            download: dynamic.download,
        };
        // 判断添加动态可选内容
        if (topic_id.length !== 0) params.topic_ids = topic_id;
        if (topics.length !== 0) params.topics = topics;
        if (dynamic.content_img.length !== 0) {
            params.csrf_token = dynamic.csrf_token;
        }
        if (existId && dynamic.content_img.length !== 0) {
            params.old_content_img = dynamic.content_img
                .filter((item) => item.src.indexOf("yakit-online.oss") > -1)
                .map((item) => item.src);
        }
        if (dynamic.content_video.src) {
            params.content_video = dynamic.content_video.src;
            params.title = dynamic.title;
            params.cover = dynamic.cover;
        }
        if (existId) params.id = existId;

        NetWorkApi<API.NewDynamic, number>({
            method: "post",
            url: "/api/dynamic/issue",
            data: params,
            userToken: true,
        })
            .then((res) => {
                for (const el of dynamic.content_img) {
                    if (el.src.indexOf("yakit-online.oss") === -1)
                        URL.revokeObjectURL(el.src);
                }
                isShow.current = false;
                setTimeout(() => onCancel(true), 50);
                setHomePageDynamicId({ value: res, trigger: !!existId });
                resetDynamic();
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 100));
    });

    const [secondShow, setSecondShow] = useState<boolean>(false);

    const [imgLoading, setImgLoading] = useState<boolean>(false);
    const imgTime = useRef<any>(null);
    const fileList = useRef<RcFile[]>([]);
    const imgList = useRef<{ src: string; name: string }[]>([]);

    const uploadImg = useMemoizedFn(() => {
        if (!isShow.current) return;
        if (!dynamic.csrf_token) {
            failed("获取关键信息失败，请关闭弹窗重新打开");
            setImgLoading(false);
            return;
        }
        if (imgList.current.length + dynamic.content_img.length >= 18) {
            setDynamic({
                ...dynamic,
                content_img: dynamic.content_img.concat(imgList.current),
            });
            imgList.current = [];
            fileList.current = [];
            setImgLoading(false);
            return;
        }
        if (fileList.current.length === 0) {
            setDynamic({
                ...dynamic,
                content_img: dynamic.content_img.concat(imgList.current),
            });
            imgList.current = [];
            fileList.current = [];
            setImgLoading(false);
            return;
        }

        // @ts-ignore
        const file: RcFile = fileList.current.pop();
        const fileName = generateTimeName();
        var formData = new FormData();
        formData.append("file", file);
        formData.append("csrf_token", dynamic.csrf_token);
        formData.append(
            "file_name",
            `${fileName}.${file.name.split(".").pop()}`
        );
        return NetWorkApi<FormData, API.ActionSucceeded>({
            method: "post",
            url: "/api/upload/imgs",
            data: formData,
            userToken: true,
        })
            .then((res) => {
                if (!isShow.current) return;
                imgList.current.push({
                    src: URL.createObjectURL(file),
                    name: `${fileName}.${file.name.split(".").pop()}`,
                });
                uploadImg();
            })
            .catch((err) => {
                uploadImg();
            });
    });
    const delImg = useMemoizedFn((info: { src: string; name: string }) => {
        NetWorkApi<API.DeleteResource, API.ActionSucceeded>({
            method: "post",
            url: "/api/delete/resource",
            data: {
                csrf_token: dynamic.csrf_token,
                file_name: [info.name],
                file_type: "img",
            },
            userToken: true,
        })
            .then((res) => {
                if (info.src.indexOf("yakit-online.oss") === -1)
                    URL.revokeObjectURL(info.src);
                setDynamic({
                    ...dynamic,
                    content_img: dynamic.content_img.filter(
                        (item) => item.name !== info.name
                    ),
                });
            })
            .catch((err) => {});
    });

    const videoTime = useRef<any>(null);
    const videoCount = useRef<number>(0);
    const [videoRate, setVideoRate] = useState<number>(0);
    const [videoSize, setVideoSize] = useState<number>(0);

    const videoUploadProgress = useMemoizedFn((file: RcFile) => {
        setVideoSize(file.size);

        if (videoTime.current) {
            clearInterval(videoTime.current);
            videoTime.current = null;
            videoCount.current = 0;
        }
        videoTime.current = setInterval(() => {
            if (videoCount.current === 11 || !isShow.current) {
                clearInterval(videoTime.current);
                videoTime.current = null;
                videoCount.current = 0;
                return;
            }
            videoCount.current = videoCount.current + 1;
            setVideoRate(videoCount.current * 9);
        }, 1000);
    });
    const videoUploadSuccess = useMemoizedFn((file: RcFile) => {
        clearInterval(videoTime.current);
        videoTime.current = null;
        videoCount.current = 0;
        setVideoRate(100);

        setDynamic({
            ...dynamic,
            title: file.name.split(".")[0] || "未命名视频",
        });
    });
    const videoUploadFailed = useMemoizedFn(() => {
        clearInterval(videoTime.current);
        videoTime.current = null;
        videoCount.current = 0;
        setVideoRate(0);
        setVideoSize(0);
    });
    const delVideo = useMemoizedFn(() => {
        const name = dynamic.content_video.name;

        NetWorkApi<API.DeleteResource, API.ActionSucceeded>({
            method: "post",
            url: "/api/delete/resource",
            data: {
                csrf_token: dynamic.csrf_token,
                file_name: [name],
                file_type: "video",
            },
            userToken: true,
        })
            .then((res) => {
                setDynamic({
                    ...dynamic,
                    content_video: {
                        src: "",
                        name: "",
                    },
                    download: false,
                });
            })
            .catch((err) => {});
    });

    const [coverMak, setCoverMask] = useState<boolean>(false);

    // 图片/视频上传时的清空判断
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
                    uploadWarnType === 1
                        ? { src: "", name: "" }
                        : dynamic.content_video,
                title: uploadWarnType === 1 ? "" : dynamic.title,
                cover: uploadWarnType === 1 ? "" : dynamic.cover,
            });
            if (uploadWarnType === 1) {
                clearInterval(videoTime.current);
                videoCount.current = 0;
                setVideoRate(0);
                setVideoSize(0);
            }
        }
        setUploadWarn(false);
    });

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
            width={520}
            className="post-dynamic-modal"
            onCancel={cancelModal}
        >
            <div className="post-dynamic-body">
                <div className="post-dynamic-header">
                    <div className="header-title">发布动态</div>
                    <CloseOutlined
                        className="header-del"
                        onClick={cancelModal}
                    />
                </div>

                <TextArea
                    className="post-dynamic-input"
                    placeholder="有什么想分享给大家～"
                    autoSize={{ minRows: 4, maxRows: 6 }}
                    maxLength={5000}
                    value={dynamic.content}
                    onChange={(e) =>
                        setDynamic({ ...dynamic, content: e.target.value })
                    }
                />

                <div className="post-dynamic-operate">
                    <div className="operate-function">
                        {!!dynamic.content_video.src ? (
                            <Button
                                type="link"
                                disabled={imgLoading}
                                icon={<UploadImgIcon className="icon-style" />}
                                onClick={() => showUploadWarn(1)}
                            />
                        ) : dynamic.content_img.length >= 18 ? (
                            <Tooltip placement="bottom" title="图片上限为18张">
                                <Button
                                    type="link"
                                    disabled={true}
                                    icon={
                                        <UploadImgIcon className="icon-style" />
                                    }
                                />
                            </Tooltip>
                        ) : (
                            <Upload
                                accept=".png,.jpg,.jpeg.,gif"
                                showUploadList={false}
                                multiple={true}
                                beforeUpload={(file: RcFile) => {
                                    if (!imgJudge(file)) {
                                        return Promise.reject();
                                    }

                                    fileList.current.push(file);

                                    if (imgTime.current) {
                                        clearTimeout(imgTime.current);
                                        imgTime.current = null;
                                    }
                                    imgTime.current = setTimeout(() => {
                                        setImgLoading(true);
                                        uploadImg();
                                    }, 200);
                                    return Promise.reject();
                                }}
                            >
                                <Button
                                    type="link"
                                    disabled={
                                        dynamic.content_img.length >= 18 ||
                                        imgLoading
                                    }
                                    icon={
                                        <UploadImgIcon className="icon-style" />
                                    }
                                />
                            </Upload>
                        )}
                        {dynamic.content_img.length !== 0 ? (
                            <Button
                                type="link"
                                disabled={videoRate > 0 && videoRate < 100}
                                icon={
                                    <UploadVideoIcon className="icon-style" />
                                }
                                onClick={() => showUploadWarn(2)}
                            />
                        ) : (
                            <SingleUpload
                                isVideo={true}
                                setValue={(res, name) =>
                                    setDynamic({
                                        ...dynamic,
                                        content_video: {
                                            src: res,
                                            name: name || "",
                                        },
                                    })
                                }
                                onProgress={videoUploadProgress}
                                onSuccess={videoUploadSuccess}
                                onFailed={videoUploadFailed}
                            >
                                <Button
                                    type="link"
                                    disabled={videoRate > 0 && videoRate < 100}
                                    icon={
                                        <UploadVideoIcon className="icon-style" />
                                    }
                                />
                            </SingleUpload>
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
                                        {(topicSearch
                                            ? [
                                                  {
                                                      id: 0,
                                                      created_at: 0,
                                                      updated_at: 0,
                                                      topics: topicSearch,
                                                      hot_num: 0,
                                                  } as API.TopicList,
                                              ]
                                            : []
                                        )
                                            .concat(topicList)
                                            .map((item, index) => {
                                                return (
                                                    <div
                                                        key={`${item.topics}-${item.id}`}
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
                                icon={<TopicIcon className="icon-style" />}
                            />
                        </Popover>
                    </div>

                    <div className="operate-publish">
                        <Button
                            className="operate-publish-btn"
                            disabled={!dynamic.content || loading}
                            onClick={releaseDynamic}
                        >
                            发布
                        </Button>
                    </div>
                </div>

                {(dynamic.content_img.length !== 0 || imgLoading) && (
                    <div className="post-dynamic-img">
                        {dynamic.content_img.map((item, index) => {
                            return (
                                <div className="img-opt" key={item.src}>
                                    <ImgShow src={item.src} />
                                    <div
                                        className="img-opt-del"
                                        onClick={() => delImg(item)}
                                    >
                                        x
                                    </div>
                                </div>
                            );
                        })}
                        {dynamic.content_img.length !== 18 && (
                            <div className="img-opt">
                                <Upload
                                    className="img-upload"
                                    accept=".png,.jpg,.jpeg,.gif"
                                    showUploadList={false}
                                    multiple={true}
                                    disabled={imgLoading}
                                    beforeUpload={(file: RcFile) => {
                                        if (!imgJudge(file)) {
                                            return Promise.reject();
                                        }
                                        if (!isShow.current)
                                            return Promise.reject();

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
                                    <Spin
                                        className="dynamic-img-spin"
                                        spinning={imgLoading}
                                    >
                                        <div className="img-add">
                                            <PlusOutlined className="icon-style" />
                                        </div>
                                    </Spin>
                                </Upload>
                            </div>
                        )}
                    </div>
                )}

                {(dynamic.content_video.src || videoSize > 0) && (
                    <div className="post-dynamic-video">
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
                            {/* {true ? (
                                <a href="#" className="video-cancel">
                                    取消上传
                                </a>
                            ) : ( */}
                            <div className="video-operate">
                                <SingleUpload
                                    disabled={videoRate > 0 && videoRate < 100}
                                    isVideo={true}
                                    setValue={(res, name) =>
                                        setDynamic({
                                            ...dynamic,
                                            content_video: {
                                                src: res,
                                                name: name || "",
                                            },
                                        })
                                    }
                                    onProgress={videoUploadProgress}
                                    onSuccess={videoUploadSuccess}
                                    onFailed={videoUploadFailed}
                                >
                                    <a
                                        href="#"
                                        className="text-style video-replace"
                                    >
                                        {dynamic.content_video.src
                                            ? "替换"
                                            : "添加"}
                                    </a>
                                </SingleUpload>
                                <Popconfirm
                                    placement="bottomLeft"
                                    title="确定要放弃上传视频吗？"
                                    onConfirm={() => delVideo()}
                                    okText="确定"
                                    cancelText="取消"
                                >
                                    {!!dynamic.content_video.src && (
                                        <a
                                            href="#"
                                            className="text-style video-del"
                                        >
                                            删除
                                        </a>
                                    )}
                                </Popconfirm>
                            </div>
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
                                    maxLength={50}
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
                                        <ImgShow
                                            isCover={true}
                                            src={dynamic.cover}
                                        />
                                        <div
                                            className={`mask-cover ${
                                                coverMak
                                                    ? "mask-cover-background"
                                                    : ""
                                            }`}
                                        >
                                            <SingleUpload
                                                setValue={(res) =>
                                                    setDynamic({
                                                        ...dynamic,
                                                        cover: res,
                                                    })
                                                }
                                            >
                                                {coverMak && (
                                                    <div className="cover-btn">
                                                        替换封面
                                                    </div>
                                                )}
                                            </SingleUpload>
                                            {/* {coverMak && (
                                                <div className="cover-btn">
                                                    裁剪封面
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                ) : (
                                    <SingleUpload
                                        setValue={(res) =>
                                            setDynamic({
                                                ...dynamic,
                                                cover: res,
                                            })
                                        }
                                    >
                                        <div className="video-cover-body">
                                            <UploadOutlined className="icon-style" />
                                            <div className="text-style">
                                                设置视频封面
                                            </div>
                                        </div>
                                    </SingleUpload>
                                )}
                            </Item>

                            {/* <Item label="允许下载">
                                <Switch
                                    checked={dynamic.download}
                                    onChange={(checked) =>
                                        setDynamic({
                                            ...dynamic,
                                            download: checked,
                                        })
                                    }
                                />
                            </Item> */}
                        </Form>
                    </div>
                )}

                <SecondConfirm
                    visible={secondShow}
                    onCancel={(flag) => {
                        setSecondShow(false);
                        if (flag) {
                            isShow.current = false;
                            setTimeout(() => onCancel(false), 50);
                            resetDynamic();
                        }
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

export default PostDynamic;
