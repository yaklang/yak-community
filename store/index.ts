import create from "zustand";
import { GithubAuth, LoginUserInfoProps } from "../types/user";

const DefaultUserInfo: LoginUserInfoProps = {
    isLogin: false,
};
const DefaultGithubAuth: GithubAuth = {
    auth_id: 0,
    head_img: "",
    name: "string",
};

interface StoreProps {
    /**@name 登录用户信息 */
    userInfo: LoginUserInfoProps;
    signIn: (info: LoginUserInfoProps) => void;
    signOut: () => void;
    /**@name github授权临时数据 */
    githubAuth: GithubAuth;
    setGithubAuth: (info: GithubAuth) => void;
    clearGithubAuth: () => void;
}
export const useStore = create<StoreProps>((set, get) => ({
    userInfo: {
        isLogin: false,
    },
    signIn: (info) => set({ userInfo: info }),
    signOut: () => set({ userInfo: DefaultUserInfo }),

    githubAuth: { ...DefaultGithubAuth },
    setGithubAuth: (info) => set({ githubAuth: { ...info } }),
    clearGithubAuth: () => set({ githubAuth: { ...DefaultGithubAuth } }),
}));
