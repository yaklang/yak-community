import create from "zustand";
import { LoginUserInfoProps } from "../types/user";

const DefaultUserInfo: LoginUserInfoProps = {
    isLogin: false,
};

interface StoreProps {
    /**@name 登录用户信息 */
    userInfo: LoginUserInfoProps;
    signIn: (info: LoginUserInfoProps) => void;
    signOut: () => void;
}
export const useStore = create<StoreProps>((set, get) => ({
    userInfo: {
        isLogin: false,
    },
    signIn: (info) => set({ userInfo: info }),
    signOut: () => set({ userInfo: DefaultUserInfo }),
}));
