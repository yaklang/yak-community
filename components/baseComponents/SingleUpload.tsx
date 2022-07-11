import React from "react";
import { Upload, UploadProps } from "antd";
import { RcFile } from "antd/lib/upload";
import { failed } from "../../utils/notification";
import { NetWorkApi } from "../../utils/fetch";

const imgJudge = (file: RcFile) => {
    if (file.size > 10 * 1024 * 1024) {
        failed("请上传10MB以内的图片");
        return false;
    }
    if (!["image/jpg", "image/jpeg", "image/png"].includes(file.type)) {
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
    if (!["video/mp4"].includes(file.type)) {
        failed("请上传MP4格式的视频");
        return false;
    }
    return true;
};

export interface SingleUploadProps extends UploadProps {
    isVideo?: boolean;
    setValue: (res: string) => any;
    onProgress?: (file: RcFile) => any;
    onSuccess?: (file: RcFile) => any;
}

export const SingleUpload: React.FC<SingleUploadProps> = React.memo((props) => {
    const {
        isVideo = false,
        setValue,
        onProgress,
        onSuccess,
        children,
        ...restProps
    } = props;

    const accept = isVideo ? ".mp4" : ".png,.jpg,.jpeg";
    const judge = isVideo ? videoJudge : imgJudge;
    const api = isVideo ? "/api/upload/video" : "/api/upload/img";

    return (
        <Upload
            accept={accept}
            showUploadList={false}
            beforeUpload={(file: RcFile) => {
                if (!judge(file)) {
                    return Promise.reject();
                }

                if (onProgress) onProgress(file);

                var formData = new FormData();
                formData.append("file_name", file);
                formData.append("type", file.type);
                NetWorkApi<FormData, string>({
                    method: "post",
                    url: api,
                    data: formData,
                    userToken: true,
                })
                    .then((res) => {
                        setValue(res);
                        if (onSuccess) onSuccess(file);
                    })
                    .catch((err) => {});

                return Promise.reject();
            }}
        >
            {children}
        </Upload>
    );
});
