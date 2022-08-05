import React from "react";
import { NextPage } from "next";

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
