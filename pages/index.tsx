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
import { useMemoizedFn } from "ahooks";
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
    } = useStore();

    const [keyword, setKeyword] = useState<string>("");
    const [listPage, setListPage] = useState<number>(1);
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
                topic_info: [],
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
            {
                id: 2,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                user_id: 1,
                user_name: "123",
                head_img: "",
                content: "123123",
                content_img: "",
                content_video:
                    "https://vd4.bdstatic.com/mda-ngg5nxij6qjte326/cae_h264/1658030681621523754/mda-ngg5nxij6qjte326.mp4",
                topic_info: [],
                topics: "",
                title: "123123",
                cover: "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6",
                download: false,
                stars: 11,
                collect: 11,
                is_collect: true,
                is_stars: true,
                is_follow: false,
                comment_num: 0,
            },
            {
                id: 3,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                user_id: 1,
                user_name: "123",
                head_img: "",
                content: "123123",
                content_img:
                    '["https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6","https://gimg2.baidu.com/image_search/src=http%3A%2F%2Ftupian.qqjay.com%2Fu%2F2017%2F1020%2F1_14136_2.jpg&refer=http%3A%2F%2Ftupian.qqjay.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660650646&t=eaf78717a4b1f99a11a40944176be149","https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6","https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6","https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6","https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6","https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6","https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6","https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6","https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6","https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F210924233115O14-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1660637672&t=5faed1def09048fe5bb6bd5368519fc6"]',
                content_video: "",
                topic_info: [],
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
            total: 3,
            total_page: 1,
        },
    });

    useEffect(() => {
        if (homePageDynamicId) {
            NetWorkApi<FetchDynamicInfo, API.DynamicListDetailResponse>({
                method: "get",
                url: "/api/dynamic/detail",
                params: { id: homePageDynamicId },
                userToken: true,
            })
                .then((res) => {
                    setList({
                        data: [res.data].concat(list.data),
                        pagemeta: list.pagemeta,
                    });
                    setHomePageDynamicId(0);
                })
                .catch((err) => {});
        }
    }, [homePageDynamicId]);

    const fetchDynamics = useMemoizedFn((page?: number, keywords?: string) => {
        const params: FetchDynamicList = {
            page: page || listPage,
            limit: 20,
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
                setList({ data: res.data || [], pagemeta: res.pagemeta });
            })
            .catch((err) => {});
    });
    const fetchNoDynamics = useMemoizedFn(
        (page?: number, keywords?: string) => {
            const params: FetchDynamicList = {
                page: page || listPage,
                limit: 20,
                order: "desc",
            };
            if (keywords || keyword) params.keywords = keywords || keyword;

            NetWorkApi<FetchDynamicList, API.DynamicListResponse>({
                method: "get",
                url: "/api/dynamic/issue/unlogged",
                params: { ...params },
            })
                .then((res) => {
                    setList({ data: res.data || [], pagemeta: res.pagemeta });
                })
                .catch((err) => {});
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
        setListPage(0);
        if (isToken) fetchDynamics(0);
        else fetchNoDynamics(0);
    }, [userInfo]);

    useEffect(() => {
        const isToken = !!getToken();
        if (homePageKeywords.trigger) {
            setListPage(0);
            setKeyword("");
            if (isToken) fetchDynamics(0, homePageKeywords.value);
            else fetchNoDynamics(0, homePageKeywords.value);
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
                                setListPage(0);
                                if (userInfo.isLogin) fetchDynamics(0);
                                else fetchNoDynamics(0);
                            }}
                        />
                        <ButtonTheme
                            className="search-btn"
                            onClick={() => {
                                setListPage(0);
                                setHomePageKeywords({
                                    value: "",
                                    trigger: false,
                                });
                                if (userInfo.isLogin) fetchDynamics(0);
                                else fetchNoDynamics(0);
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
                                    key={item.id}
                                    info={item}
                                    updateInfo={updateDynamicInfo}
                                    updateDynamicInfo={updateDynamicInfoApi}
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
