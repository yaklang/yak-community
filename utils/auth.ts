export const TokenKey: string = "Admin-Token";
export const UserId: string = "User-ID";
export const Platform: string = "Platform";

export function getToken() {
    return window.localStorage.getItem(TokenKey);
}

export function getUser() {
    return window.localStorage.getItem(UserId);
}

export function getPlatform() {
    return window.localStorage.getItem(Platform);
}

export function setTokenUser(token: string, user: string) {
    window.localStorage.setItem(TokenKey, token);
    window.localStorage.setItem(UserId, user);
}

export function setPlatform(platform: string) {
    window.localStorage.setItem(Platform, platform);
}

export function userSignOut() {
    window.localStorage.removeItem(UserId);
    window.localStorage.removeItem(TokenKey);
    window.localStorage.removeItem(Platform);
}
