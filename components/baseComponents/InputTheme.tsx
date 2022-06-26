import React from "react";
import { Input, InputProps } from "antd";

export interface InputThemeProps extends InputProps {
    isTheme?: boolean;
    isLogin?: boolean;
}

export const InputTheme: React.FC<InputThemeProps> = (props) => {
    const { isTheme = true, isLogin = false, className, ...restProps } = props;

    return (
        <Input
            {...restProps}
            className={`input-default-style ${
                isTheme ? "yak-theme-input" : ""
            } ${isLogin ? "yak-login-input" : ""} ${className || ""}`}
        ></Input>
    );
};
