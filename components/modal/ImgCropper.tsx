import React, { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { Button, Modal } from "antd";
import {} from "@ant-design/icons";
import ReactCrop, {
    centerCrop,
    Crop,
    makeAspectCrop,
    PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const centerAspectCrop: (mediaWidth: number, mediaHeight: number) => Crop = (
    mediaWidth,
    mediaHeight
) => {
    return centerCrop(
        makeAspectCrop(
            { unit: "px", width: 152, height: 152 },
            1,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
};

const DownloadImg: () => any = () => {};

interface ImgCropperProps {
    visible: boolean;
    onCancel: (flag: boolean) => any;
}

const ImgCropper: NextPage<ImgCropperProps> = (props) => {
    const { visible, onCancel } = props;

    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    const [imgs, setImgs] = useState<string>("");

    const imgRef = useRef<HTMLImageElement>(null);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height));
    };

    useEffect(() => {
        const t = setTimeout(async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current
            ) {
                const { width, height, x, y } = completedCrop;
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const img = imgRef.current;

                const scaleX = img.naturalWidth / img.width;
                const scaleY = img.naturalHeight / img.height;
                const pixelRatio = window.devicePixelRatio;

                canvas.width = Math.floor(width * scaleX * pixelRatio);
                canvas.height = Math.floor(height * scaleY * pixelRatio);
                ctx?.scale(pixelRatio, pixelRatio);
                // @ts-ignore
                ctx.imageSmoothingEnabled = true;
                // @ts-ignore
                ctx.imageSmoothingQuality = "high";

                const cropX = x * scaleX;
                const cropY = y * scaleY;
                const centerX = img.naturalWidth / 2;
                const centerY = img.naturalHeight / 2;

                ctx?.save();

                ctx?.translate(-cropX, -cropY);
                ctx?.translate(centerX, centerY);
                ctx?.scale(1, 1);
                ctx?.translate(-centerX, -centerY);
                ctx?.drawImage(
                    img,
                    0,
                    0,
                    img.naturalWidth,
                    img.naturalHeight,
                    0,
                    0,
                    img.naturalWidth,
                    img.naturalHeight
                );
                ctx?.restore();

                const url = canvas.toDataURL("image/png");
                console.log(url);
                setImgs(url);
            }
        }, 100);

        return () => {
            clearTimeout(t);
        };
    }, [completedCrop]);

    return (
        <Modal
            visible={visible}
            centered={true}
            closable={false}
            footer={null}
            keyboard={false}
            maskClosable={false}
            destroyOnClose={true}
            className="img-croppper-modal"
            width={568}
            onCancel={() => onCancel(false)}
        >
            <div className="img-croppper-body">
                <div className="body-title">裁剪图片</div>

                <div className="body-cropper">
                    <ReactCrop
                        className="img-cropper-style"
                        aspect={1}
                        minWidth={96}
                        minHeight={96}
                        keepSelection={true}
                        crop={crop}
                        onChange={(_, c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                    >
                        <img
                            ref={imgRef}
                            src="https://t12.baidu.com/it/u=3376231878,176147949&fm=30&app=106&f=JPEG?w=312&h=208&s=AA5210C7024E4555DC8CDCBB03005001"
                            className="img-style"
                            onLoad={onImageLoad}
                            alt="Crop me"
                            crossOrigin="anonymous"
                        />
                    </ReactCrop>
                    <img src={imgs} />
                </div>

                <div className="body-hint">
                    发布动态后，缩略图会参照裁剪后的图片进行展示
                </div>

                <div className="body-operate">
                    <Button
                        className="btn-style cancel-btn"
                        onClick={() => {
                            onCancel(false);
                        }}
                    >
                        取消
                    </Button>
                    <Button className="btn-style complete-btn">完成</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ImgCropper;
