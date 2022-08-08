import { AppProps } from "next/app";
import { NextPage } from "next";
import Head from "next/head";
import Layouts from "../components/layout/Layouts";
import "../styles/globals.scss";
import "antd/dist/antd.css";
import Script from "next/script";

const App: NextPage<AppProps> = (props) => {
    const { Component, pageProps } = props;

    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta charSet="utf-8" />
                <title>Yak 社区</title>
                <style jsx global>
                    {`
                        * {
                            margin: 0;
                            padding: 0;
                        }
                    `}
                </style>
            </Head>
            {pageProps.isLogin || pageProps.isMiddle ? (
                <>
                    <Script src="https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js"></Script>
                    <Component {...pageProps} />
                </>
            ) : (
                <Layouts>
                    <Script src="https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js"></Script>
                    <Component {...pageProps} />
                </Layouts>
            )}
        </>
    );
};

export default App;
