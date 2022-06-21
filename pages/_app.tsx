import { AppProps } from "next/app";
import { NextPage } from "next";
import Head from "next/head";
import Layouts from "../components/Layouts";
import "../styles/globals.scss";
import "antd/dist/antd.css";

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
            {pageProps.isLogin ? (
                <Component {...pageProps} />
            ) : (
                <Layouts>
                    <Component {...pageProps} />
                </Layouts>
            )}
        </>
    );
};

export default App;
