import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { API } from "../types/api";
import { FetchDynamicList } from "../types/extraApi";
import { NetWorkApi } from "../utils/fetch";
import HomeLayout from "../components/HomeLayout";
import TopicList from "../components/TopicList";
import CommentItem from "../components/CommentItem";
import { ButtonTheme } from "../components/baseComponents/ButtonTheme";
import { InputTheme } from "../components/baseComponents/InputTheme";
import { useMemoizedFn } from "ahooks";
import { getToken } from "../utils/auth";
import { useStore } from "../store";

interface HomeProps {}

const Home: NextPage<HomeProps> = (props) => {
    const [keyword, setKeyword] = useState<string>("");

    const { userInfo } = useStore();

    const [list, setList] = useState<API.DynamicListResponse>({
        data: [
            {
                id: 1,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                user_id: 1,
                user_name: "123",
                head_img: "",
                content: "123123",
                content_img: "",
                content_video: "",
                topic_id: 0,
                topics: "",
                title: "",
                cover: "",
                download: false,
                stars: 11,
                collect: 11,
                is_collect: true,
                is_stars: true,
                is_follow: false,
                comment_num: 0,
            },
        ],
        pagemeta: {
            page: 1,
            limit: 20,
            total: 0,
            total_page: 1,
        },
    });

    const fetchDynamics = useMemoizedFn(() => {
        NetWorkApi<FetchDynamicList, API.DynamicListResponse>({
            method: "get",
            url: "/api/dynamic/issue",
            params: { Page: 1, Limit: 20, Order: "desc", keywords: keyword },
            userToken: true,
        })
            .then((res) => {
                console.log(res);
                setList({ data: res.data || [], pagemeta: res.pagemeta });
            })
            .catch((err) => {});
    });
    const fetchNoDynamics = useMemoizedFn(() => {
        return false;
        NetWorkApi<FetchDynamicList, API.DynamicListResponse>({
            method: "get",
            url: "/api/dynamic/issue",
            params: { Page: 1, Limit: 20, Order: "desc" },
        })
            .then((res) => {
                console.log(res);
                setList({ data: res.data || [], pagemeta: res.pagemeta });
            })
            .catch((err) => {});
    });

    useEffect(() => {
        const flag = !!getToken();
        if (flag) {
            fetchDynamics();
        } else {
            fetchNoDynamics();
        }
    }, []);

    const updateDynamicInfo = useMemoizedFn(
        (type: "user" | "stars" | "collect", info: API.DynamicLists) => {
            if (type === "collect" || type === "stars") {
                setList({
                    data: list.data.map((item) => {
                        if (item.id === info.id) return info;
                        return item;
                    }),
                    pagemeta: list.pagemeta,
                });
            }
            if (type === "user") {
                setList({
                    data: list.data.map((item) => {
                        if (item.user_id === info.user_id)
                            item.is_follow = !item.is_follow;
                        return item;
                    }),
                    pagemeta: list.pagemeta,
                });
            }
        }
    );

    return (
        <HomeLayout>
            <div className="home-page-wrapper">
                <div className="home-page-title">Yak 社区</div>

                <div className="home-page-search">
                    <Input.Group className="search-body" compact>
                        <InputTheme
                            className="search-input"
                            isTheme={false}
                            isInfo={true}
                            prefix={<SearchOutlined className="icon-style" />}
                            placeholder="搜索..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onPressEnter={() => {
                                if (userInfo.isLogin) fetchDynamics();
                                else fetchNoDynamics();
                            }}
                        />
                        <ButtonTheme
                            className="search-btn"
                            onClick={() => {
                                if (userInfo.isLogin) fetchDynamics();
                                else fetchNoDynamics();
                            }}
                        >
                            搜索
                        </ButtonTheme>
                    </Input.Group>
                </div>

                <div className="home-page-content">
                    <div className="content-dynamic-body">
                        {list.data.map((item, index) => {
                            return (
                                <CommentItem
                                    key={index}
                                    info={item}
                                    updateInfo={updateDynamicInfo}
                                />
                            );
                        })}
                    </div>

                    <div className="content-topic-list">
                        <TopicList />
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
};

export default Home;
