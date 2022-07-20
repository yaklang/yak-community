import React from "react";
import { NextPage } from "next";

interface NoLayoutProps {
    children?: React.ReactNode;
}

const NoLayout: NextPage<NoLayoutProps> = (props) => {
    return <div className="no-layout-container">{props.children}</div>;
};

export default NoLayout;
