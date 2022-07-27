export interface LoginUserInfoProps {
    isLogin: boolean;
    user_id?: number;
    name?: string;
    head_img?: string;
    isRole?: boolean;
}

export interface GithubAuth {
    auth_id: number;
    head_img: string;
    name: string;
}
