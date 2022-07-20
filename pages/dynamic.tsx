import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import {} from "antd";
import { UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import AvatarCard from "../components/avatar/AvatarCard";
import TopicList from "../components/TopicList";
import { LeftOutThemeIcon } from "../public/icons";
import NoLayout from "../components/layout/NoLayout";
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

    const fetchDynamicInfo = useMemoizedFn((id: number, isUpdate?: boolean) => {
        NetWorkApi<FetchDynamicInfo, API.DynamicListDetailResponse>({
            method: "get",
            url: "/api/dynamic/detail",
            params: { id },
            userToken: true,
        })
            .then((res) => {
                setDynamic(res.data);
                if (!isUpdate) fetchDynamicUserInfo(res.data.user_id);
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

    const updateDynamicInfo = useMemoizedFn(
        (type: "user" | "stars" | "collect", info: API.DynamicLists) => {
            if (!dynamic) return;

            if (type === "stars") {
                setDynamic({
                    ...dynamic,
                    stars: info.stars,
                    is_stars: info.is_stars,
                });
            }
            if (type === "collect") {
                setDynamic({
                    ...dynamic,
                    collect: info.collect,
                    is_collect: info.is_collect,
                });
            }
        }
    );

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
                            <CommentItem
                                info={dynamic}
                                isDetail={true}
                                updateInfo={updateDynamicInfo}
                                updateDynamicInfo={(id) =>
                                    fetchDynamicInfo(id, true)
                                }
                            />
                        )}
                    </div>
                    <div className="dynamic-author-and-topic">
                        <div className="dynamic-author">
                            {dynamic && (
                                <AvatarCard
                                    info={fans}
                                    updateInfo={() => {
                                        setDynamic({
                                            ...dynamic,
                                            is_follow: !dynamic?.is_follow,
                                        });
                                        setFans({
                                            ...fans,
                                            fans: fans.is_follow
                                                ? fans.fans - 1
                                                : fans.fans + 1,
                                            is_follow: !fans.is_follow,
                                        });
                                    }}
                                />
                            )}
                        </div>
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
