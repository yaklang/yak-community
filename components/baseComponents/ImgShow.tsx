import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";

export interface ImgShowProps {
    isCover?: boolean;
    isMedia?: boolean;
    src: string;
    onclick?: () => any;
}

export const ImgShow: React.FC<ImgShowProps> = (props) => {
    const { isCover = false, isMedia = false, src, onclick } = props;

    const bodyRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [isWidth, setIsWidth] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);

    const ClassName = isCover
        ? "img-show-video-wrapper"
        : isMedia
        ? "img-show-media-wrapper"
        : "img-show-img-wrapper";

    const setImgOffset = () => {
        if (!imgRef || !imgRef.current) return;
        const img = imgRef.current;
        const { offsetWidth, offsetHeight } = img;

        if (isCover || isMedia) {
            if (!bodyRef || !bodyRef.current) return;
            const body = bodyRef.current;
            const { offsetWidth: bodyWidth, offsetHeight: bodyHeight } = body;
            setIsWidth(
                offsetWidth >= offsetHeight
                    ? offsetHeight < bodyHeight
                    : offsetWidth < bodyWidth
            );
        } else {
            setIsWidth(offsetWidth >= offsetHeight);
        }
    };

    useEffect(() => {
        const time = setInterval(() => {
            if (!imgRef || !imgRef.current) return;
            const img = imgRef.current;
            const { offsetWidth, offsetHeight } = img;
            if (!offsetWidth || !offsetHeight) return;
            else {
                setImgOffset();
                clearInterval(time);
                setLoading(false);
            }
        }, 50);
    }, []);

    return (
        <div
            className={`img-show-wrapper ${ClassName}`}
            onClick={() => {
                if (onclick) onclick();
            }}
        >
            <div ref={bodyRef} className="img-show-body">
                {isCover && !isMedia && (
                    <img
                        ref={imgRef}
                        src={src}
                        className={
                            isWidth ? "cover-width-style" : "cover-height-style"
                        }
                    />
                )}
                {!isCover && isMedia && (
                    <img
                        ref={imgRef}
                        src={src}
                        className={
                            isWidth ? "cover-width-style" : "cover-height-style"
                        }
                    />
                )}
                {!isCover && !isMedia && (
                    <img
                        ref={imgRef}
                        src={src}
                        className={
                            isWidth ? "cover-height-style" : "cover-width-style"
                        }
                    />
                )}
                {loading && (
                    <div className="img-spin">
                        <Spin spinning={true} />
                    </div>
                )}
            </div>
        </div>
    );
};
