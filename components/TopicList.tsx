import React, { useState, useEffect, useCallback } from "react";
import { NextPage } from "next";
import { Button } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { useMemoizedFn } from "ahooks";

const TopicIcon: string[] = [
    "/images/topic/topic-1.png",
    "/images/topic/topic-2.png",
    "/images/topic/topic-3.png",
];

interface TopicInfoProps {
    name: string;
}

interface TopicListProps {}

const TopicList: NextPage<TopicListProps> = (props) => {
    const [list, setList] = useState<TopicInfoProps[]>([
        { name: "1" },
        { name: "2" },
        { name: "3" },
        { name: "4" },
        { name: "5" },
        { name: "6" },
        { name: "7" },
        { name: "8" },
        { name: "9" },
        { name: "10" },
        { name: "11" },
        { name: "12" },
        { name: "13" },
        { name: "14" },
        { name: "15" },
        { name: "16" },
        { name: "17" },
        { name: "18" },
        { name: "19" },
        { name: "20" },
        { name: "21" },
        { name: "22" },
        { name: "23" },
        { name: "24" },
        { name: "25" },
        { name: "26" },
        { name: "27" },
        { name: "28" },
        { name: "29" },
        { name: "30" },
    ]);
    const [showList, setShowList] = useState<TopicInfoProps[]>([
        { name: "1" },
        { name: "2" },
        { name: "3" },
        { name: "4" },
        { name: "5" },
        { name: "6" },
        { name: "7" },
        { name: "8" },
        { name: "9" },
        { name: "10" },
    ]);
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

    return (
        <div className="topic-list-main">
            <div className="topic-list-container">
                <div className="topic-list-header">
                    <div className="topic-list-header-title">话题榜</div>
                    <div className="topic-list-header-refresh">
                        <Button type="link" className="refresh-btn">
                            <SyncOutlined className="icon-style" />
                            点击刷新
                        </Button>
                    </div>
                </div>
                <div className="topic-list-body">
                    {showList.map((item, index) => {
                        return (
                            <TopicItem
                                key={item.name}
                                info={item}
                                index={index}
                                page={page}
                            />
                        );
                    })}
                </div>
            </div>
            <div className="topic-list-change">
                <Button type="link" className="change-btn" onClick={changePage}>
                    换一批
                </Button>
            </div>
        </div>
    );
};

interface TopicItemProps {
    info: TopicInfoProps;
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
            <div
                className="topic-item-main-title"
                title={`雄安新区${info.name}周年`}
            >{`雄安新区${info.name}周年`}</div>
        </div>
    );
};

export default TopicList;
