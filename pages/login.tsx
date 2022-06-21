import React, { useState } from "react";
import { NextPage } from "next";
import {  } from "@ant-design/icons";
import {  } from "antd";

import Link from "next/link";

interface LoginProps {}

const Login: NextPage<LoginProps> = (props) => {
    return <div>
        <div></div>
    </div>;
};

Login;

export async function getStaticProps() {
    return {
        props: { isLogin: true },
    };
}

export default Login;
