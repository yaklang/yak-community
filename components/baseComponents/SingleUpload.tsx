import React from "react";
import { Upload, UploadProps } from "antd";
import { RcFile } from "antd/lib/upload";
import { failed } from "../../utils/notification";
import { NetWorkApi } from "../../utils/fetch";

export interface SingleUploadProps extends UploadProps {
    isVideo?: boolean;
    setValue: (res: string) => any;
}

export const SingleUpload: React.FC<SingleUploadProps> = (props) => {
    const { isVideo = false, setValue, children, ...restProps } = props;

    return (
        <Upload
            accept={isVideo ? ".mp4" : ".png,.jpg,.jpeg"}
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

                var formData = new FormData();
                formData.append("file_name", file);
                formData.append("type", file.type);
                NetWorkApi<FormData, string>({
                    method: "post",
                    url: isVideo ? "/api/upload/video" : "/api/upload/img",
                    data: formData,
                    userToken: true,
                })
                    .then((res) => setValue(res))
                    .catch((err) => {});

                return Promise.reject();
            }}
        >
            {children}
        </Upload>
    );
};
