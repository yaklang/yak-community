import fetch from "../utils/fetch";

export const userLogin = (params: any) => {
    return fetch({
        method: "get",
        url: "/api/user/getUserInfo",
    });
};
