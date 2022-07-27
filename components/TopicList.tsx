import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { Button } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { useMemoizedFn } from "ahooks";
import { SearchPageMeta } from "../types/extraApi";
import { NetWorkApi } from "../utils/fetch";
import { API } from "../types/api";
import { useStore } from "../store";

const TopicIcon: string[] = [
    "/images/topic/topic-1.png",
    "/images/topic/topic-2.png",
    "/images/topic/topic-3.png",
];

interface TopicListProps {}

const TopicList: NextPage<TopicListProps> = (props) => {
    const { homePageDynamicId } = useStore();

    const [loading, setLoading] = useState<boolean>(false);
    const [list, setList] = useState<API.TopicList[]>([]);
    const [showList, setShowList] = useState<API.TopicList[]>([]);
    const [page, setPage] = useState<0 | 1 | 2>(0);

    const changePage = useMemoizedFn(() => {
        if (page === 2) {
            const lists = list.slice(0, 10);
            setShowList(lists);
            setPage(0);
        } else {
            const lists = list.slice((page + 1) * 10, (page + 2) * 10);
            setShowList(lists);
            // @ts-ignore
            setPage(page + 1);
        }
    });

    const fetchTopicList = useMemoizedFn(() => {
        if (loading) return;
        setLoading(true);

        NetWorkApi<SearchPageMeta, API.TopicResponse>({
            method: "get",
            url: "/api/forum/topics/hot",
            params: {
                page: 1,
                limit: 30,
                order: "desc",
            },
        })
            .then((res) => {
                setList(res.data || []);
                if (Array.isArray(res.data)) {
                    setShowList(
                        res.data.length > 10 ? res.data.slice(0, 10) : res.data
                    );
                }
                setPage(0);
            })
            .catch((err) => {})
            .finally(() => setTimeout(() => setLoading(false), 300));
    });

    useEffect(() => {
        fetchTopicList();
    }, []);

    useEffect(() => {
        if (homePageDynamicId) fetchTopicList();
    }, [homePageDynamicId]);

    return (
        <div className="topic-list-main">
            <div className="topic-list-container">
                <div className="topic-list-header">
                    <div className="topic-list-header-title">话题榜</div>
                    <div className="topic-list-header-refresh">
                        <Button
                            type="link"
                            className="refresh-btn"
                            onClick={fetchTopicList}
                        >
                            <SyncOutlined className="icon-style" />
                            点击刷新
                        </Button>
                    </div>
                </div>
                <div className="topic-list-body">
                    {showList.map((item, index) => {
                        return (
                            <TopicItem
                                key={item.topics}
                                info={item}
                                index={index}
                                page={page}
                            />
                        );
                    })}
                </div>
            </div>

            {(list.length === 0 || list.length > 10) && (
                <div className="topic-list-change">
                    {list.length > 10 ? (
                        <Button
                            type="link"
                            className="change-btn"
                            onClick={changePage}
                        >
                            换一批
                        </Button>
                    ) : (
                        <span className="no-hot-style">暂无热门话题</span>
                    )}
                </div>
            )}
        </div>
    );
};

interface TopicItemProps {
    info: API.TopicList;
    index: number;
    page: 0 | 1 | 2;
}
const TopicItem = (props: TopicItemProps) => {
    const { info, index, page } = props;
    return (
        <div className="topic-item-main">
            <div className="topic-item-main-rank">
                {page === 0 ? (
                    index <= 2 ? (
                        <img src={TopicIcon[index]} className="img-style" />
                    ) : (
                        <span className="rank-style">{index + 1}</span>
                    )
                ) : (
                    <span className="rank-style">{page * 10 + index + 1}</span>
                )}
            </div>
            <div className="topic-item-main-title" title={info.topics}>
                {info.topics}
            </div>
        </div>
    );
};

export default TopicList;
