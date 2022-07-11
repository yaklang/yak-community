import React from "react";
import { Button, ButtonProps } from "antd";

export interface ButtonThemeProps extends ButtonProps {
    isTheme?: boolean;
    isInfo?: boolean;
    isDanger?: boolean;
}

export const ButtonTheme: React.FC<ButtonThemeProps> = (props) => {
    const {
        isTheme = true,
        isInfo = false,
        isDanger = false,
        className,
        children,
        ...restProps
    } = props;

    return (
        <Button
            {...restProps}
            className={`button-default-style ${
                isTheme ? "yak-theme-button" : ""
            } ${isInfo ? "yak-info-button" : ""} ${
                isDanger ? "yak-danger-button" : ""
            }  ${className || ""}`}
        >
            {children}
        </Button>
    );
};
