import Cookies from "js-cookie";

export const TokenKey: string = "Admin-Token";
export const UserId: string = "User-ID";

export function getToken() {
    return Cookies.get(TokenKey);
}

export function setToken(token: string) {
    return Cookies.set(TokenKey, token);
}

export function removeToken() {
    return Cookies.remove(TokenKey);
}

export function userSignOut() {
    window.localStorage.removeItem(UserId);
    window.localStorage.removeItem(TokenKey);
    removeToken();
}
