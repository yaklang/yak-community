import React from "react";
import { NextPage } from "next";
import { Popover } from "antd";
import { GithubOutlined, WechatOutlined } from "@ant-design/icons";

interface FootersProps {}

const Footers: NextPage<FootersProps> = (props) => {
    return (
        <div className="footer-outside">
            <div className="footer-main">
                <div className="footer-left">
                    <a
                        href="https://www.yaklang.io/"
                        className="footer-left-home-page"
                    >
                        <img src="/images/yakLogo.png" className="img-style" />
                    </a>
                    <div className="footer-left-copyright">{`Copyright © ${new Date().getFullYear()} for Yak Project. 京ICP备17047700号-3`}</div>
                    <a
                        href="https://www.yaklang.io/docs/intro/"
                        className="footer-left-doc footer-left-link-style"
                    >
                        官方文档
                    </a>
                    <a
                        href="https://www.yaklang.io/team"
                        className="footer-left-team footer-left-link-style"
                    >
                        关于我们
                    </a>
                </div>
                <div className="footer-right">
                    <a
                        rel="noopener noreferrer"
                        href="https://github.com/yaklang/yakit"
                        target="_blank"
                        className="footer-right-github"
                    >
                        <GithubOutlined className="icon-style" />
                    </a>

                    <div className="footer-right-wechat">
                        <Popover
                            overlayClassName="wechat-code-popover"
                            content={
                                <div>
                                    <img
                                        src="/images/wechat.jpg"
                                        className="wechat-code-img"
                                    />
                                    <div className="wechat-code-title">
                                        微信扫码关注公众号
                                    </div>
                                </div>
                            }
                        >
                            <WechatOutlined className="icon-style" />
                        </Popover>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footers;
