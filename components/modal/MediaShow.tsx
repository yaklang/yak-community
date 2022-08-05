import React, { useState } from "react";
import { NextPage } from "next";
import { Button, Modal } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { ImgShow } from "../baseComponents/ImgShow";

interface MediaShowProps {
    isVideo?: boolean;
    imgs?: string[];
    imgsIndex?: number;
    video?: string;
    visible: boolean;
    onCancel: () => any;
}

const MediaShow: NextPage<MediaShowProps> = (props) => {
    const {
        isVideo = false,
        imgs = [],
        imgsIndex,
        video,
        visible,
        onCancel,
    } = props;

    const [imgIndex, setImgIndex] = useState<number>(imgsIndex || 0);

    return (
        <Modal
            visible={visible}
            centered={true}
            footer={null}
            className="media-show-modal"
            width={"100%"}
            onCancel={onCancel}
        >
            <div className="media-show-body">
                {isVideo ? (
                    <div className="video-wrapper">
                        <video
                            src={video || ""}
                            controls
                            className="video-style"
                        ></video>
                    </div>
                ) : (
                    <div className="media-img-wrapper">
                        <div className="media-img-show-body">
                            <ImgShow isMedia={true} src={imgs[imgIndex]} />
                        </div>

                        <Button
                            type="link"
                            className="left-change"
                            disabled={imgIndex === 0}
                            onClick={() =>
                                setImgIndex(imgIndex === 0 ? 0 : imgIndex - 1)
                            }
                        >
                            <LeftOutlined
                                className={
                                    imgIndex === 0
                                        ? "icon-disabled-style"
                                        : "icon-style"
                                }
                            />
                        </Button>
                        <Button
                            type="link"
                            className="right-change"
                            disabled={imgIndex === imgs.length - 1}
                            onClick={() =>
                                setImgIndex(
                                    imgIndex === imgs.length - 1
                                        ? imgs.length - 1
                                        : imgIndex + 1
                                )
                            }
                        >
                            <RightOutlined
                                className={
                                    imgIndex === imgs.length - 1
                                        ? "icon-disabled-style"
                                        : "icon-style"
                                }
                            />
                        </Button>

                        <div className="media-img-preview-body">
                            {imgs.map((item, index) => {
                                return (
                                    <div
                                        key={item}
                                        className={`media-img-preview-opt ${
                                            index === imgIndex
                                                ? "media-img-preview-opt-selected"
                                                : ""
                                        }`}
                                        onClick={() => setImgIndex(index)}
                                    >
                                        <ImgShow src={item} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default MediaShow;
