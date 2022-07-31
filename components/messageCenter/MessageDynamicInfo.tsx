import React from "react";
import { NextPage } from "next";
import { CaretRightOutlined } from "@ant-design/icons";
import { API } from "../../types/api";
import { useRouter } from "next/router";
import { ImgShow } from "../baseComponents/ImgShow";

interface MessageDynamicInfoProps {
    isReply?: boolean;
    info: API.MessageCenterStars | API.MessageCenterComment;
}

const MessageDynamicInfo: NextPage<MessageDynamicInfoProps> = (props) => {
    const { isReply = false, info } = props;
    const imgs: string[] =
        !info.dynamic_content_img || info.dynamic_content_img === "null"
            ? []
            : JSON.parse(info.dynamic_content_img);

    const router = useRouter();

    return (
        <>
            {(info.dynamic_status === 2 ||
                (imgs.length === 0 && !info.dynamic_cover)) && (
                <div
                    className={`message-dynamic-wrapper ${
                        isReply
                            ? "message-dynamic-reply-bg-color"
                            : "message-dynamic-bg-color"
                    }`}
                    onClick={() => {
                        if (info.dynamic_status === 2) return;
                        router.push(`/dynamic?id=${info.dynamic_id}`);
                    }}
                >
                    <div className="dynamic-name text-ellipsis-style">
                        {`@${info.dynamic_user_name}`}
                    </div>

                    {info.dynamic_status === 2 ? (
                        <div className="del-dynamic-info">
                            抱歉、此动态已被删除
                        </div>
                    ) : (
                        <div className="dynamic-content">
                            {info.dynamic_content}
                        </div>
                    )}
                </div>
            )}

            {info.dynamic_status !== 2 && imgs.length > 0 && (
                <div
                    className={`message-dynamic-img-wrapper ${
                        isReply
                            ? "message-dynamic-reply-bg-color"
                            : "message-dynamic-bg-color"
                    }`}
                    onClick={() => {
                        if (info.dynamic_status === 2) return;
                        router.push(`/dynamic?id=${info.dynamic_id}`);
                    }}
                >
                    <div className="dynamic-img">
                        <ImgShow src={imgs[0]} />
                    </div>
                    <div className="dynamic-content">
                        <div className="dynamic-name text-ellipsis-style">
                            {`@${info.dynamic_user_name}`}
                        </div>

                        <div className="dynamic-text">
                            {info.dynamic_content}
                        </div>
                    </div>
                </div>
            )}

            {info.dynamic_status !== 2 && !!info.dynamic_cover && (
                <div
                    className={`message-dynamic-video-wrapper ${
                        isReply
                            ? "message-dynamic-reply-bg-color"
                            : "message-dynamic-bg-color"
                    }`}
                    onClick={() => {
                        if (info.dynamic_status === 2) return;
                        router.push(`/dynamic?id=${info.dynamic_id}`);
                    }}
                >
                    <div className="dynamic-video">
                        <ImgShow isCover={true} src={info.dynamic_cover} />
                        <div className="video-mask">
                            <CaretRightOutlined className="icon-style" />
                        </div>
                    </div>
                    <div className="dynamic-content">
                        <div className="dynamic-name text-ellipsis-style">
                            {`@${info.dynamic_user_name}`}
                        </div>

                        <div className="video-title text-ellipsis-style">
                            {info.dynamic_title}
                        </div>

                        <div className="dynamic-text text-ellipsis-style">
                            {info.dynamic_content}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MessageDynamicInfo;
