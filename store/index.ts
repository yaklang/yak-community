import create from "zustand";
import { UserInfoProps } from "../types/user";

const DefaultUserInfo: UserInfoProps = {
    isLogin: false,
    githubName: null,
    githubHeadImg: null,
    wechatName: null,
    wechatHeadImg: null,
    qqName: null,
    qqHeadImg: null,
    role: null,
    token: null,
};

interface StoreProps {
    /**@name 登录用户信息 */
    userInfo: UserInfoProps;
    signIn: (info: UserInfoProps) => void;
    signOut: () => void;
}
export const useStore = create<StoreProps>((set, get) => ({
    userInfo: {
        isLogin: false,
        githubName: null,
        githubHeadImg: null,
        wechatName: null,
        wechatHeadImg: null,
        qqName: null,
        qqHeadImg: null,
        role: null,
        token: null,
    },
    signIn: (info) => set({ userInfo: info }),
    signOut: () => set({ userInfo: DefaultUserInfo }),
}));
