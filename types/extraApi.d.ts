export interface SearchPageMeta {
    page: number;
    limit: number;
    order_by?: string;
    order: "asc" | "desc";
}

export interface FetchDynamicList extends SearchPageMeta {
    keywords?: string;
    user_id?: number;
}

export type OperationType = "add" | "remove";

export interface FollowUserProps {
    follow_user_id: number;
    operation: OperationType;
}

export interface FetchDynamicInfo {
    id: number;
}

export interface FetchUserFans {
    user_id: number;
}

export interface UserCollectLikeProps {
    dynamic_id: number;
    type: "collect" | "stars";
    operation: OperationType;
}

export interface FetchMainComments extends SearchPageMeta {
    dynamic_id: number;
}

export interface FetchSubComments extends SearchPageMeta {
    root_id: number;
    dynamic_id: number;
}

export interface StarsComment {
    comment_id: number;
    operation: OperationType;
}

export interface UpdateAuthProps {
    code: string;
    type: "github" | "wechat";
    auth_id: number;
}

export interface FetchFollowList extends SearchPageMeta {
    user_id: number;
}
