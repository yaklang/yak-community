import React, { useState, useRef } from "react";
import { NextPage } from "next";
import { Divider, Modal, Spin, Tooltip } from "antd";
import { FormOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useMemoizedFn } from "ahooks";
import { API } from "../../types/api";
import { ButtonTheme } from "../baseComponents/ButtonTheme";
import { InputTheme } from "../baseComponents/InputTheme";
import { failed, success } from "../../utils/notification";
import { NetWorkApi } from "../../utils/fetch";
import { SingleUpload } from "../baseComponents/SingleUpload";
import { queryURLParams, replaceParamVal } from "../../utils/urlTool";
import { useStore } from "../../store";
import { getPlatform, setTokenUser } from "../../utils/auth";
import { UpdateAuthProps } from "../../types/extraApi";

type ModalType = "name" | "phone" | "wechat" | "github" | "";
const ModalTypeTitle: { [key: string]: string } = {
    name: "修改基本信息",
    phone: "修改手机号码",
    wechat: "修改微信账号",
};

interface SettingInfoProps {
    info: API.UserDetail;
    onUpdateUserInfo: () => any;
}
interface FetchPhoneCode {
    phone: string;
    user_id: number;
}
interface UpdatePhoneProps {
    phone: string;
    code: string;
    user_id: number;
}

const SettingInfo: NextPage<SettingInfoProps> = (props) => {
    const { info, onUpdateUserInfo } = props;
    const Wechat: API.UserAurh | undefined = info.child?.filter((item) => {
        return item.from_platform === "wechat";
    })[0];
    const Github: API.UserAurh | undefined = info.child?.filter((item) => {
        return item.from_platform === "github";
    })[0];

    const { signIn, setGithubAuth } = useStore();

    const platform = getPlatform();

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalIndex, setModalIndex] = useState<ModalType>("");

    const [warnModal, setWarnModal] = useState<boolean>(false);
    const [warnModalType, setWarnModalType] = useState<"wechat" | "github">(
        "wechat"
    );

    const [name, setName] = useState<string>(info.name);
    const [img, setImg] = useState<string>(info.head_img);
    const [imgLoading, setImgLoading] = useState<boolean>(false);
    const [showUpload, setShowUpload] = useState<boolean>(false);

    const [phone, setPhone] = useState<string>("");
    const [phoneFlag, setPhoneFlag] = useState<boolean>(true);
    const [phoneCode, setPhoneCode] = useState<string>("");
    const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
    const [time, setTime] = useState<number>(180);
    const codeTime = useRef<any>(null);
    const codeTimeCount = useRef<number>(180);

    const clearTime = () => {
        clearInterval(codeTime.current);
        codeTime.current = null;
        codeTimeCount.current = 180;
        setTime(180);
        setBtnDisabled(false);
    };
    const reg = /^1[3456789][0-9]{9}$/;
    const sendNote = useMemoizedFn(() => {
        if (!phone || phone.length !== 11 || !reg.test(phone)) {
            setPhoneFlag(false);
            return;
        }
        if (btnDisabled && codeTimeCount.current >= 1) return;

        if (codeTime.current) clearTime();
        setBtnDisabled(true);
        codeTime.current = setInterval(() => {
            const value = codeTimeCount.current - 1;
            codeTimeCount.current = value;
            setTime(value);

            if (value === 0) clearTime();
        }, 1000);

        NetWorkApi<FetchPhoneCode, API.ActionSucceeded>({
            method: "get",
            url: "/api/update/phone/code",
            params: { phone: phone, user_id: info.id },
            userToken: true,
        })
            .then((res) => {})
            .catch((err) => {
                clearTime();
                failed("获取验证码次数过多，请等几分钟后重试");
            });
    });

    const getAuthUlr = (source: "github" | "wechat") => {
        NetWorkApi<{ source: "github" | "wechat" }, string>({
            method: "get",
            url: "/api/auth/from",
            params: { source: source },
        })
            .then((res) => {
                const redirect_uri = decodeURIComponent(
                    queryURLParams(res)["redirect_uri"]
                );
                const newUrl = replaceParamVal(
                    res,
                    "redirect_uri",
                    encodeURIComponent(`${redirect_uri}auth`)
                );
                setAuthUrl(source, newUrl);
            })
            .catch((err) => {});
    };
    const setAuthUrl = (source: "github" | "wechat", url: string) => {
        if (source === "github") {
            setGithubAuth({
                auth_id: Github?.auth_id || 0,
                head_img: "",
                name: "",
            });
            setTimeout(() => {
                window.location.href = url;
            }, 10);
        } else {
            setTimeout(() => {
                var urls = url.split("?")[1];
                const urlSearchParams = new URLSearchParams(urls);
                const params = Object.fromEntries(urlSearchParams.entries());
                // @ts-ignore
                var obj = new window.WxLogin({
                    self_redirect: true,
                    id: "wechat-auth",
                    appid: params.appid,
                    scope: params.scope.split("#")[0],
                    redirect_uri: params.redirect_uri,
                });
                window.addEventListener("message", (e) => {
                    if (
                        e &&
                        e.data &&
                        e.data.code &&
                        e.data.source &&
                        e.data.source === "wechatauth"
                    ) {
                        NetWorkApi<UpdateAuthProps, API.ActionSucceeded>({
                            method: "get",
                            url: "/api/update/auth",
                            params: {
                                code: e.data.code as string,
                                type: source,
                                auth_id: Wechat?.auth_id || 0,
                            },
                            userToken: true,
                        })
                            .then((res) => {
                                setTimeout(() => {
                                    setModalVisible(false);
                                    onUpdateUserInfo();
                                }, 10);
                            })
                            .catch((err) => {
                                setModalVisible(false);
                            });
                    }
                });
            }, 50);
        }
    };

    const showModal = useMemoizedFn((flag: ModalType) => {
        if (flag === "github") {
            getAuthUlr("github");
            return;
        }
        if (flag === "wechat") {
            setTimeout(() => getAuthUlr("wechat"), 10);
        }
        setModalIndex(flag);
        setModalVisible(true);
    });

    const showWarnModal = useMemoizedFn((type: "wechat" | "github") => {
        setWarnModalType(type);
        setWarnModal(true);
    });

    const updateName = useMemoizedFn(() => {
        if (!name) {
            failed("请输入用户名");
            return;
        }

        NetWorkApi<API.UpdateUser, API.ActionSucceeded>({
            method: "post",
            url: "/api/forum/user",
            data: { user_id: info.id, name, head_img: img },
            userToken: true,
        })
            .then((res) => {
                onUpdateUserInfo();
                setModalVisible(false);
            })
            .catch((err) => {});
    });

    const updatePhone = useMemoizedFn(() => {
        if (!phone || phone.length !== 11 || !reg.test(phone)) {
            failed("请输入正确的电话号码");
            return;
        }
        if (!phoneCode) {
            failed("请输入验证码");
            return;
        }

        NetWorkApi<UpdatePhoneProps, API.ActionSucceeded>({
            method: "post",
            url: "/api/update/phone",
            params: { user_id: info.id, phone, code: phoneCode },
            userToken: true,
        })
            .then((res) => {
                onUpdateUserInfo();
                clearTime();
                setModalVisible(false);
            })
            .catch((err) => {});
    });

    const unbindMediaAcount = useMemoizedFn(() => {
        NetWorkApi<{ auth_id: number }, API.ActionSucceeded>({
            method: "delete",
            url: "/api/forum/user",
            params: {
                auth_id:
                    warnModalType === "github"
                        ? Github?.auth_id || 0
                        : Wechat?.auth_id || 0,
            },
            userToken: true,
        })
            .then((res) => {
                success("解绑成功");
                onUpdateUserInfo();
            })
            .catch((err) => {})
            .finally(() => setWarnModal(false));
    });

    return (
        <div className="setting-info-wrapper">
            <div className="setting-info-row">
                <div className="info-show">
                    <div className="info-show-img">
                        <img src={info.head_img} className="img-style" />
                    </div>
                    <div
                        className="info-show-content text-ellipsis-style"
                        title={info.name || ""}
                    >
                        {info.name}
                    </div>
                </div>
                <div className="info-operate">
                    <div
                        className="info-operate-btn"
                        onClick={() => showModal("name")}
                    >
                        修改
                    </div>
                </div>
            </div>

            <div className="setting-info-row">
                <div className="info-show">
                    <div className="info-show-img">
                        <img
                            src="/images/user/telephone.png"
                            className="img-style"
                        />
                    </div>
                    <div className="info-show-content text-ellipsis-style">
                        手机号
                    </div>
                </div>
                <div className="info-operate">
                    <div className="info-operate-name">
                        {info.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                    </div>
                    <div
                        className="info-operate-btn"
                        onClick={() => showModal("phone")}
                    >
                        修改
                    </div>
                </div>
            </div>

            <div className="setting-info-row">
                <div className="info-show">
                    <div className="info-show-img">
                        <img
                            src="/images/user/github.png"
                            className="img-style"
                        />
                    </div>
                    <div className="info-show-content text-ellipsis-style">
                        GitHub
                    </div>
                </div>
                <div className="info-operate">
                    {Github ? (
                        <>
                            <div className="info-operate-name">
                                {Github.name}
                            </div>
                            {Wechat && platform !== "github" && (
                                <>
                                    <div
                                        className="info-operate-unbind"
                                        onClick={() => showWarnModal("github")}
                                    >
                                        解绑
                                    </div>
                                    <div className="info-operate-divider">
                                        <Divider type="vertical" />
                                    </div>
                                </>
                            )}
                            <div
                                className="info-operate-btn"
                                onClick={() => showModal("github")}
                            >
                                修改
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="info-operate-name">未绑定</div>
                            <div
                                className="info-operate-btn"
                                onClick={() => showModal("github")}
                            >
                                绑定
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="setting-info-row">
                <div className="info-show">
                    <div className="info-show-img">
                        <img
                            src="/images/user/wechat.png"
                            className="img-style"
                        />
                    </div>
                    <div className="info-show-content text-ellipsis-style">
                        微信
                    </div>
                </div>
                <div className="info-operate">
                    {Wechat ? (
                        <>
                            <div className="info-operate-name">
                                {Wechat.name}
                            </div>
                            {Github && platform !== "wechat" && (
                                <>
                                    <div
                                        className="info-operate-unbind"
                                        onClick={() => showWarnModal("wechat")}
                                    >
                                        解绑
                                    </div>
                                    <div className="info-operate-divider">
                                        <Divider type="vertical" />
                                    </div>
                                </>
                            )}
                            <div
                                className="info-operate-btn"
                                onClick={() => showModal("wechat")}
                            >
                                修改
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="info-operate-name">未绑定</div>
                            <div
                                className="info-operate-btn"
                                onClick={() => showModal("wechat")}
                            >
                                绑定
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Modal
                centered={true}
                footer={false}
                maskClosable={false}
                destroyOnClose={true}
                className="setting-info-modal"
                width={376}
                title={ModalTypeTitle[modalIndex] || "异常信息窗口-关闭重试"}
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                }}
            >
                {modalIndex === "name" && (
                    <div className="modal-body setting-name-img">
                        <Spin spinning={imgLoading}>
                            <div
                                className="img-body"
                                onMouseEnter={() => setShowUpload(true)}
                                onMouseLeave={() => setShowUpload(false)}
                            >
                                <img src={img} className="img-style" />
                                <SingleUpload
                                    setValue={(res) => setImg(res)}
                                    onProgress={() => setImgLoading(true)}
                                    onSuccess={() => setImgLoading(false)}
                                >
                                    {showUpload && (
                                        <div className="login-fourth-img-upload">
                                            <FormOutlined className="icon-style" />
                                            更改
                                        </div>
                                    )}
                                </SingleUpload>
                            </div>
                        </Spin>
                        <div className="input-body">
                            <InputTheme
                                className="input-style"
                                isTheme={false}
                                isLogin={true}
                                prefix={
                                    <div>
                                        昵称
                                        <Divider
                                            type="vertical"
                                            className="divider-style"
                                        />
                                    </div>
                                }
                                placeholder="请输入昵称"
                                maxLength={50}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="btn-body">
                            <ButtonTheme
                                className="btn-style cancel-style"
                                isTheme={false}
                                onClick={() => {
                                    setName(info.name);
                                    setImg(info.head_img);
                                    setModalVisible(false);
                                    setModalIndex("");
                                }}
                            >
                                取消
                            </ButtonTheme>
                            <ButtonTheme
                                className="btn-style"
                                onClick={updateName}
                            >
                                保存
                            </ButtonTheme>
                        </div>
                    </div>
                )}
                {modalIndex === "phone" && (
                    <div className="modal-body setting-phone">
                        <div className="phone-body">
                            <InputTheme
                                className="input-style"
                                isTheme={false}
                                isLogin={true}
                                prefix={
                                    <div>
                                        +86
                                        <Divider
                                            type="vertical"
                                            className="divider-style"
                                        />
                                    </div>
                                }
                                suffix={
                                    phoneFlag ? (
                                        <></>
                                    ) : (
                                        <Tooltip
                                            placement="top"
                                            title="请输入正确的手机号码"
                                        >
                                            <ExclamationCircleOutlined className="info-style" />
                                        </Tooltip>
                                    )
                                }
                                placeholder="请输入要绑定的手机号"
                                maxLength={11}
                                value={phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(
                                        /[^\d]/g,
                                        ""
                                    );
                                    const flag =
                                        value.length !== 11 || reg.test(value);
                                    setPhoneFlag(flag);
                                    setPhone(value);
                                }}
                            />
                        </div>

                        <div className="code-body">
                            <InputTheme
                                className="input-style"
                                isTheme={false}
                                isLogin={true}
                                placeholder="验证码"
                                maxLength={6}
                                value={phoneCode}
                                onChange={(e) => {
                                    setPhoneCode(
                                        e.target.value.replace(/[^\d]/g, "")
                                    );
                                }}
                            />
                            <ButtonTheme
                                className={`btn-style ${
                                    btnDisabled ? "btn-disabled-style" : ""
                                }`}
                                disabled={btnDisabled}
                                onClick={() => sendNote()}
                            >
                                {btnDisabled ? `${time}s` : "发送"}
                            </ButtonTheme>
                        </div>

                        <div className="btn-body">
                            <ButtonTheme
                                className="btn-style cancel-style"
                                isTheme={false}
                                onClick={() => {
                                    setPhone("");
                                    setPhoneCode("");
                                    setModalVisible(false);
                                    setModalIndex("");
                                }}
                            >
                                取消
                            </ButtonTheme>
                            <ButtonTheme
                                className={`btn-style ${
                                    !phone || !phoneCode
                                        ? "btn-disabled-style"
                                        : ""
                                }`}
                                disabled={!phone || !phoneCode}
                                onClick={updatePhone}
                            >
                                确定
                            </ButtonTheme>
                        </div>
                    </div>
                )}
                {modalIndex === "wechat" && (
                    <div className="modal-body setting-wechat-code">
                        <div id="wechat-auth" className="wechat-login"></div>
                    </div>
                )}
                {modalIndex === "" && <div></div>}
            </Modal>

            <Modal
                centered={true}
                footer={false}
                className="setting-info-modal"
                width={368}
                title={`确定要解绑${
                    warnModalType === "github" ? "Github" : "微信"
                }账号吗？`}
                visible={warnModal}
                onCancel={() => {
                    setWarnModal(false);
                }}
            >
                <div className="unbind-body">
                    <div className="body-text">{`解绑后，下次使用${
                        warnModalType === "github" ? "Github" : "微信"
                    }登录需要重新绑定哦～`}</div>
                    <div className="body-btn">
                        <ButtonTheme
                            className="btn-style cancel-style"
                            isTheme={false}
                            onClick={() => setWarnModal(false)}
                        >
                            取消
                        </ButtonTheme>
                        <ButtonTheme
                            className="btn-style"
                            onClick={unbindMediaAcount}
                        >
                            确定
                        </ButtonTheme>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SettingInfo;
