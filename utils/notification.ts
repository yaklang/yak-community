import React from "react";
import { notification } from "antd";

export const warn = (msg: React.ReactNode) => {
    notification["warning"]({ message: msg, placement: "topRight" });
};

export const info = (msg: React.ReactNode) => {
    notification["info"]({ message: msg, placement: "topRight" });
};

export const success = (msg: React.ReactNode) => {
    notification["success"]({ message: msg, placement: "topRight" });
};

export const failed = (msg: React.ReactNode) => {
    notification["error"]({ message: msg, placement: "topRight" });
};
