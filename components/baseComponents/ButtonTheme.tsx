import React from "react";
import { Button, ButtonProps } from "antd";

export interface ButtonThemeProps extends ButtonProps {
    isTheme?: boolean;
}

export const ButtonTheme: React.FC<ButtonThemeProps> = (props) => {
    const { isTheme = true, className, children, ...restProps } = props;

    return (
        <Button
            {...restProps}
            className={`button-default-style ${
                isTheme ? "yak-theme-button" : ""
            }  ${className || ""}`}
        >
            {children}
        </Button>
    );
};
