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
    /** 登录用户信息 */
    userInfo: LoginUserInfoProps;
    signIn: (info: LoginUserInfoProps) => void;
    signOut: () => void;

    /** github授权临时数据 */
    githubAuth: GithubAuth;
    setGithubAuth: (info: GithubAuth) => void;
    clearGithubAuth: () => void;

    /** 首页搜索关键词 */
    homePageKeywords: { value: string; trigger: boolean };
    setHomePageKeywords: (keywords: {
        value: string;
        trigger: boolean;
    }) => void;

    /**发动态时触发首页新增动态项 */
    homePageDynamicId: number;
    setHomePageDynamicId: (id: number) => void;
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

    homePageKeywords: { value: "", trigger: false },
    setHomePageKeywords: (info) => set({ homePageKeywords: { ...info } }),

    homePageDynamicId: 0,
    setHomePageDynamicId: (id) => set({ homePageDynamicId: id }),
}));
