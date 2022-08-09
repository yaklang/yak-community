import React from "react";
import { NextPage } from "next";

interface MiddlesProps {}

const Middles: NextPage<MiddlesProps> = (props) => {
    return (
        <div className="login-middle-body">
            <div className="middle-loading-body">
                <div className="multi-spinner-container">
                    <div className="multi-spinner">
                        <div className="multi-spinner">
                            <div className="multi-spinner">
                                <div className="multi-spinner">
                                    <div className="multi-spinner">
                                        <div className="multi-spinner"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="loading-body-title">
                    正在登录验证中，请稍等片刻......
                </div>
            </div>
        </div>
    );
};

export default Middles;

// 传递给app组件的数据
export async function getStaticProps() {
    return {
        props: { isMiddle: true },
    };
}
