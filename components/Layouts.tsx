import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { FormOutlined, UpOutlined } from "@ant-design/icons";
import Headers from "./Headers";
import Footers from "./Footers";
import PostDynamic from "./modal/PostDynamic";

interface LayoutsProps {
    children?: React.ReactNode;
}

const Layouts: NextPage<LayoutsProps> = (props) => {
    const [postMessage, setPostMessage] = useState<boolean>(false);

    useEffect(() => {
        const DesignW = 1920;
        const FontRate = 16;

        document.getElementsByTagName("html")[0].style.fontSize =
            (document.body.offsetWidth / DesignW) * FontRate + "px";
        document.getElementsByTagName("body")[0].style.fontSize =
            (document.body.offsetWidth / DesignW) * FontRate + "px";

        window.addEventListener(
            "onorientationchange" in window ? "orientationchange" : "resize",
            () => {
                document.getElementsByTagName("html")[0].style.fontSize =
                    (document.body.offsetWidth / DesignW) * FontRate + "px";
                document.getElementsByTagName("body")[0].style.fontSize =
                    (document.body.offsetWidth / DesignW) * FontRate + "px";
            }
        );
    }, []);

    return (
        <div className="app">
            <Headers />
            <div className="main-container">{props.children}</div>
            <Footers />
            <div className="layout-back-top">
                <div
                    className="btn-style publish-btn"
                    onClick={() => setPostMessage(true)}
                >
                    <FormOutlined className="icon-style" />
                </div>
                <div
                    className="btn-style top-btn"
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                >
                    <div className="btn-icon">
                        <UpOutlined className="icon-style" />
                    </div>
                    <div className="text-style">置顶</div>
                </div>
            </div>

            <PostDynamic
                visible={postMessage}
                onCancel={() => setPostMessage(false)}
            />
        </div>
    );
};

export default Layouts;
