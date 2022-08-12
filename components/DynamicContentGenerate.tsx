import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useStore } from "../store";

export interface DynamicContentGenerateProps {
    id: number;
    content: string;
}

export const DynamicContentGenerate: React.FC<DynamicContentGenerateProps> = (
    props
) => {
    const { id = 0, content } = props;
    const ContentSplit = content.split(/#[^#]+?#/).filter((item) => !!item);
    const TopicContentSplit = content
        .split(/#([^#]+?)#/)
        .filter((item) => !!item);

    const { hotTopicContent, setHotTopicContent } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (hotTopicContent) router.push("/");
    }, [hotTopicContent]);

    return (
        <>
            {TopicContentSplit.map((item, index) => {
                if (ContentSplit.indexOf(item) > -1) {
                    return item;
                } else {
                    return (
                        <span
                            key={`${id}-${item}-${index}`}
                            className="dynamic-content-body-topic"
                            onClick={() => setHotTopicContent(item)}
                        >{` #${item}# `}</span>
                    );
                }
            })}
        </>
    );
};
