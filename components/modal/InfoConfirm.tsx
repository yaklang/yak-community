import React from "react";
import { NextPage } from "next";
import { Modal } from "antd";
import { ButtonTheme } from "../baseComponents/ButtonTheme";

interface InfoConfirmProps {
    width?: number;
    title?: string;
    content: string;
    visible: boolean;
    onCancel: () => any;
    onSubmit: () => any;
}

const InfoConfirm: NextPage<InfoConfirmProps> = (props) => {
    const { width, title, content, visible, onCancel, onSubmit } = props;

    return (
        <Modal
            centered={true}
            footer={null}
            className="info-confirm-modal"
            width={width || 368}
            title={title || "请确认以下内容"}
            visible={visible}
            onCancel={() => onCancel()}
        >
            <div className="info-body">
                <div className="body-text">{content}</div>
                <div className="body-btn">
                    <ButtonTheme
                        className="btn-style cancel-style"
                        isTheme={false}
                        onClick={onCancel}
                    >
                        取消
                    </ButtonTheme>
                    <ButtonTheme className="btn-style" onClick={onSubmit}>
                        确定
                    </ButtonTheme>
                </div>
            </div>
        </Modal>
    );
};

export default InfoConfirm;
