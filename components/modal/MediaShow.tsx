import React, { useState } from "react";
import { NextPage } from "next";
import { Modal } from "antd";
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
            width={"80%"}
            onCancel={onCancel}
        >
            <div className="media-show-body">
                {isVideo ? (
                    <div className="video-wrapper">
                        <video src={video || ""} controls className="video-style"></video>
                    </div>
                ) : (
                    <div className="img-wrapper">
                        <ImgShow src={imgs[imgIndex]} />

                        <div
                            className="left-change"
                            onClick={() =>
                                setImgIndex(imgIndex === 0 ? 0 : imgIndex - 1)
                            }
                        >
                            <LeftOutlined className="icon-style" />
                        </div>
                        <div
                            className="right-change"
                            onClick={() =>
                                setImgIndex(
                                    imgIndex === imgs.length - 1
                                        ? imgs.length - 1
                                        : imgIndex + 1
                                )
                            }
                        >
                            <RightOutlined className="icon-style" />
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default MediaShow;
