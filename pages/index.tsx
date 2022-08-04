import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { API } from "../types/api";
import { FetchDynamicInfo, FetchDynamicList } from "../types/extraApi";
import { NetWorkApi } from "../utils/fetch";
import HomeLayout from "../components/layout/HomeLayout";
import TopicList from "../components/TopicList";
import CommentItem from "../components/CommentItem";
import { ButtonTheme } from "../components/baseComponents/ButtonTheme";
import { InputTheme } from "../components/baseComponents/InputTheme";
import { useGetState, useMemoizedFn } from "ahooks";
import { getToken } from "../utils/auth";
import { useStore } from "../store";

interface HomeProps {}

const Home: NextPage<HomeProps> = (props) => {
    const {
        userInfo,
        homePageKeywords,
        setHomePageKeywords,
        homePageDynamicId,
        setHomePageDynamicId,
        hotTopicContent,
        setHotTopicContent,
    } = useStore();

    const [keyword, setKeyword] = useState<string>("");
    const [listPage, setListPage] = useState<number>(1);
    const [loading, setLoading, getLoading] = useGetState<boolean>(false);
    const [list, setList] = useState<API.DynamicListResponse>({
        data: [
            // {
            //     id: 1,
            //     created_at: new Date().getTime(),
            //     updated_at: new Date().getTime(),
            //     user_id: 1,
            //     user_name: "123",
            //     head_img: "",
            //     content:
            //         "123123123123123123123123\n1231231\n3123123\n123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123\n123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123",
            //     content_img: "",
            //     content_video: "",
            //     topic_info: [],
            //     topics: "",
            //     title: "",
            //     cover: "",
            //     download: false,
            //     stars: 11,
            //     collect: 11,
            //     is_collect: true,
            //     is_stars: false,
            //     is_follow: false,
            //     comment_num: 10,
            //     status: 1,
            // },
        ],
        pagemeta: {
            page: 1,
            limit: 10,
            total: 0,
            total_page: 1,
        },
    });

    const nextPage = useMemoizedFn((e: Event) => {
        if (getLoading()) return;
        if (list.data.length === list.pagemeta.total) return;

        if (e && e.target && (e.target as any).scrollingElement) {
            const scroll = (e.target as any).scrollingElement as HTMLElement;
            if (
                scroll.scrollTop + scroll.clientHeight >=
                scroll.scrollHeight - 100
            ) {
                const isToken = !!getToken();
                const pages = listPage;
                setListPage(pages + 1);
                if (isToken) fetchDynamics(pages + 1);
                else fetchNoDynamics(pages + 1);
            }
        }
    });
    useEffect(() => {
        document.addEventListener("scroll", nextPage);
        return () => {
            window.removeEventListener("scroll", nextPage);
        };
    }, []);

    useEffect(() => {
        if (!homePageDynamicId.trigger && !!homePageDynamicId.value) {
            NetWorkApi<FetchDynamicInfo, API.DynamicListDetailResponse>({
                method: "get",
                url: "/api/dynamic/detail",
                params: { id: homePageDynamicId.value },
                userToken: true,
            })
                .then((res) => {
                    setList({
                        data: [res.data].concat(list.data),
                        pagemeta: list.pagemeta,
                    });
                    setHomePageDynamicId({ value: 0, trigger: false });
                })
                .catch((err) => {});
        }
    }, [homePageDynamicId]);

    const fetchDynamics = useMemoizedFn((page?: number, keywords?: string) => {
        if (getLoading()) return;

        setLoading(true);
        const params: FetchDynamicList = {
            page: page || listPage,
            limit: 10,
            order: "desc",
        };
        if (keywords !== undefined || keyword)
            params.keywords = keywords || keyword;

        NetWorkApi<FetchDynamicList, API.DynamicListResponse>({
            method: "get",
            url: "/api/dynamic/issue",
            params: { ...params },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data:
                        page === 1
                            ? res.data || []
                            : list.data.concat(res.data || []),
                    pagemeta: res.pagemeta,
                });
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 100));
    });
    const fetchNoDynamics = useMemoizedFn(
        (page?: number, keywords?: string) => {
            if (getLoading()) return;

            setLoading(true);
            const params: FetchDynamicList = {
                page: page || listPage,
                limit: 10,
                order: "desc",
            };
            if (keywords || keyword) params.keywords = keywords || keyword;

            NetWorkApi<FetchDynamicList, API.DynamicListResponse>({
                method: "get",
                url: "/api/dynamic/issue/unlogged",
                params: { ...params },
            })
                .then((res) => {
                    setList({
                        data:
                            page === 1
                                ? res.data || []
                                : list.data.concat(res.data || []),
                        pagemeta: res.pagemeta,
                    });
                })
                .catch((err) => {})
                .finally(() => setTimeout(() => setLoading(false), 50));
        }
    );

    // 前端自主更新操作数据
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

    useEffect(() => {
        const isToken = !!getToken();
        setListPage(1);
        if (isToken) fetchDynamics(1);
        else fetchNoDynamics(1);
    }, [userInfo]);

    useEffect(() => {
        const isToken = !!getToken();
        if (homePageKeywords.trigger) {
            setListPage(1);
            setKeyword(homePageKeywords.value);
            if (isToken) fetchDynamics(1, homePageKeywords.value);
            else fetchNoDynamics(1, homePageKeywords.value);
        }
    }, [homePageKeywords]);

    // 更新动态局部数据(请求后端获取)
    const updateDynamicInfoApi = useMemoizedFn((id: number) => {
        NetWorkApi<FetchDynamicInfo, API.DynamicListDetailResponse>({
            method: "get",
            url: "/api/dynamic/detail",
            params: { id },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data: list.data.map((item) => {
                        if (item.id === res.data.id) return res.data;
                        return item;
                    }),
                    pagemeta: list.pagemeta,
                });
            })
            .catch((err) => {});
    });
    // 页面内搜索功能
    const searchKeyword = useMemoizedFn(() => {
        setListPage(1);
        setHomePageKeywords({
            value: "",
            trigger: false,
        });
        if (userInfo.isLogin) fetchDynamics(1);
        else fetchNoDynamics(1);
    });

    const delDynamic = useMemoizedFn((info: API.DynamicLists) => {
        NetWorkApi<{ id: number }, API.ActionSucceeded>({
            method: "post",
            url: "/api/dynamic/violations/delete",
            params: { id: info.id },
            userToken: true,
        })
            .then((res) => {
                setList({
                    data: list.data.filter((item) => item.id !== info.id),
                    pagemeta: list.pagemeta,
                });
            })
            .catch((err) => {});
    });

    useEffect(() => {
        const isToken = !!getToken();
        if (hotTopicContent) {
            setListPage(1);
            setKeyword(hotTopicContent);
            if (isToken) fetchDynamics(1, hotTopicContent);
            else fetchNoDynamics(1, hotTopicContent);
            setHotTopicContent("");
        }
    }, [hotTopicContent]);

    return (
        <HomeLayout>
            <div className="home-page-wrapper">
                <div className="home-page-title">Ya! 一刻</div>

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
                            onPressEnter={() => searchKeyword()}
                        />
                        <ButtonTheme
                            className="search-btn"
                            onClick={() => searchKeyword()}
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
                                    key={item.id}
                                    isRole={userInfo.isLogin && userInfo.isRole}
                                    onRoleDel={() => delDynamic(item)}
                                    info={item}
                                    updateInfo={updateDynamicInfo}
                                    updateDynamicInfo={updateDynamicInfoApi}
                                />
                            );
                        })}

                        {loading && (
                            <div className="list-loading">正在加载中...</div>
                        )}

                        {!loading && list.data.length === 0 && (
                            <div className="list-loading">
                                暂无动态，期待您的发布
                            </div>
                        )}
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
