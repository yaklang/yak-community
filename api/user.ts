import fetch from "../utils/fetch";

export const userInfo = (params: any) => {
    return fetch({
        method: "get",
        url: "/api/user/getUserInfo",
    });
};
