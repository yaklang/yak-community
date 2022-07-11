import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import {} from "antd";
import {} from "@ant-design/icons";

interface HomeLayoutProps {
    children?: React.ReactNode;
}

const HomeLayout: NextPage<HomeLayoutProps> = (props) => {
    return (
        <div className="home-layout-container home-layout-bg">
            <div className="home-layout-body">{props.children}</div>
        </div>
    );
};

export default HomeLayout;
