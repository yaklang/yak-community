import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { UserOutlined } from "@ant-design/icons";
import {} from "antd";

import Link from "next/link";
import AvatarCard from "../components/avatar/AvatarCard";
import TopicList from "../components/TopicList";
import { LeftOutThemeIcon } from "../public/icons";
import NoLayout from "../components/NoLayout";
import CommentItem from "../components/CommentItem";
import { useStore } from "../store";
import { useMemoizedFn } from "ahooks";
import { NetWorkApi } from "../utils/fetch";
import { API } from "../types/api";
import { FetchDynamicInfo, FetchUserFans } from "../types/extraApi";

interface DynamicProps {}

const Dynamic: NextPage<DynamicProps> = (props) => {
    const router = useRouter();

    const [dynamic, setDynamic] = useState<API.DynamicLists>();
    const [fans, setFans] = useState<API.UserHead>({
        user_id: 0,
        user_name: "",
        head_img: "",
        follow_num: 0,
        fans: 0,
        collect_num: 0,
        dynamic_num: 0,
        is_follow: false,
    });

    const fetchDynamicInfo = useMemoizedFn((id: number) => {
        NetWorkApi<FetchDynamicInfo, API.DynamicListDetailResponse>({
            method: "get",
            url: "/api/dynamic/detail",
            params: { id },
            userToken: true,
        })
            .then((res) => {
                setDynamic(res.data);
                fetchDynamicUserInfo(res.data.user_id);
            })
            .catch((err) => {});
    });

    const fetchDynamicUserInfo = useMemoizedFn((user: number) => {
        NetWorkApi<FetchUserFans, API.UserHead>({
            method: "get",
            url: "/api/dynamic/user/head",
            params: { user_id: user },
            userToken: true,
        })
            .then((res) => {
                setFans(res);
            })
            .catch((err) => {});
    });

    useEffect(() => {
        const id = router.query.id;
        if (!id) return;

        fetchDynamicInfo(+(id as string));
    }, [router]);

    return (
        <NoLayout>
            <div className="dynamic-wrapper">
                <div className="dynamic-back">
                    <div
                        className="dynamic-back-btn"
                        onClick={() => router.push("/")}
                    >
                        <LeftOutThemeIcon className="icon-style" />
                        &nbsp; 返回
                    </div>
                </div>

                <div className="dynamic-body">
                    <div className="dynamic-comment-body">
                        {dynamic && (
                            <CommentItem info={dynamic} isDetail={true} />
                        )}
                    </div>
                    <div className="dynamic-author-and-topic">
                        {dynamic && (
                            <div className="dynamic-author">
                                <AvatarCard
                                    info={fans}
                                    isFollow={dynamic.is_collect}
                                    updateInfo={() => {
                                        setDynamic({
                                            ...dynamic,
                                            is_collect: !dynamic?.is_collect,
                                        });
                                        setFans({
                                            ...fans,
                                            is_follow: !fans.is_follow,
                                        });
                                    }}
                                />
                            </div>
                        )}
                        <div className="dynamic-topic-list">
                            <TopicList />
                        </div>
                    </div>
                </div>
            </div>
        </NoLayout>
    );
};

export default Dynamic;
