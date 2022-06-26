import React from "react";
import { NextPage } from "next";
import { Button, Modal } from "antd";

interface SecondConfirmProps {
    visible: boolean;
    onCancel: (flag: boolean) => any;
}

const SecondConfirm: NextPage<SecondConfirmProps> = (props) => {
    const { visible, onCancel } = props;

    return (
        <Modal
            visible={visible}
            centered={true}
            closable={false}
            footer={null}
            className="second-confirm-modal"
            width={262}
            onCancel={() => onCancel(false)}
        >
            <div className="second-confirm-body">
                <div className="close-title">确认关闭?</div>
                <div className="close-subtitle">关闭之后将不可恢复</div>
                <div className="close-btn">
                    <Button
                        className="btn-style cancel-style"
                        onClick={() => onCancel(false)}
                    >
                        取消
                    </Button>
                    <Button
                        className="btn-style confirm-style"
                        onClick={() => onCancel(true)}
                    >
                        确认
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SecondConfirm;
