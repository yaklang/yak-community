import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { BackTop } from "antd";
import { FormOutlined, UpOutlined } from "@ant-design/icons";
import Router from "next/router";
import Headers from "./Headers";
import Footers from "./Footers";
import {} from "../public/icons";

interface LayoutsProps {
    children?: React.ReactNode;
}

const Layouts: NextPage<LayoutsProps> = (props) => {
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
            <BackTop className="layout-back-top" visibilityHeight={0}>
                <div
                    className="btn-style publish-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <FormOutlined className="icon-style" />
                </div>
                <div className="btn-style top-btn">
                    <div className="btn-icon">
                        <UpOutlined className="icon-style" />
                    </div>
                    <div className="text-style">置顶</div>
                </div>
            </BackTop>
        </div>
    );
};

export default Layouts;
