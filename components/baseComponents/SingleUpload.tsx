import React from "react";
import { Upload, UploadProps } from "antd";
import { RcFile } from "antd/lib/upload";
import { failed } from "../../utils/notification";
import { NetWorkApi } from "../../utils/fetch";
import { generateTimeName } from "../../utils/timeTool";

export const imgJudge = (file: RcFile) => {
    if (file.size > 10 * 1024 * 1024) {
        failed("请上传10MB以内的图片");
        return false;
    }
    if (
        !["image/jpg", "image/jpeg", "image/png", "image/gif"].includes(
            file.type
        )
    ) {
        failed("请上传jpg、jpeg、png格式的图片");
        return false;
    }
    return true;
};

const videoJudge = (file: RcFile) => {
    if (file.size > 200 * 1024 * 1024) {
        failed("请上传200MB以内的视频");
        return false;
    }
    if (
        !["video/mp4", "video/avi", "video/wmv", "video/flv"].includes(
            file.type
        )
    ) {
        failed("请上传MP4/AVI/WMV/FLV格式的视频");
        return false;
    }
    return true;
};

export interface SingleUploadProps extends UploadProps {
    isVideo?: boolean;
    setValue?: (res: string, name: string) => any;
    onProgress?: (file: RcFile) => any;
    onSuccess?: (file: RcFile, res: string) => any;
    onFailed?: () => any;
}
// eslint-disable-next-line react/display-name
export const SingleUpload: React.FC<SingleUploadProps> = React.memo((props) => {
    const {
        isVideo = false,
        setValue,
        onProgress,
        onSuccess,
        onFailed,
        children,
        ...restProps
    } = props;

    const accept = isVideo ? ".mp4,.avi,.wmv,.flv" : ".png,.jpg,.jpeg,.gif";
    const judge = isVideo ? videoJudge : imgJudge;
    const api = isVideo ? "/api/upload/video" : "/api/upload/img";

    return (
        <Upload
            {...restProps}
            accept={accept}
            showUploadList={false}
            beforeUpload={(file: RcFile) => {
                if (!judge(file)) {
                    return Promise.reject();
                }

                const name = generateTimeName();

                if (onProgress) onProgress(file);

                var formData = new FormData();
                if (isVideo) {
                    formData.append("file", file);
                    formData.append(
                        "file_name",
                        `${name}.${file.name.split(".").pop()}`
                    );
                } else {
                    formData.append("file_name", file);
                    formData.append("type", file.type);
                }

                NetWorkApi<FormData, string>({
                    method: "post",
                    url: api,
                    data: formData,
                    userToken: true,
                })
                    .then((res) => {
                        if (setValue)
                            setValue(
                                res,
                                `${name}.${file.name.split(".").pop()}`
                            );
                        if (onSuccess) onSuccess(file, res);
                    })
                    .catch((err) => {
                        if (onFailed) onFailed();
                    });

                return Promise.reject();
            }}
        >
            {children}
        </Upload>
    );
});
