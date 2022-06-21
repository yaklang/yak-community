import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import {} from "antd";
import {} from "@ant-design/icons";

interface UserLayoutProps {
    children?: React.ReactNode;
}

const UserLayout: NextPage<UserLayoutProps> = (props) => {
    return (
        <div className="user-layout-container user-layout-bg">
            <div className="user-layout-bg"></div>
            <div className="user-layout-body">{props.children}</div>
        </div>
    );
};

export default UserLayout;
