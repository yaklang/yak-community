import React, { ReactNode, useState } from "react";
import { Typography } from "antd";
import { ParagraphProps } from "antd/lib/typography/Paragraph";

import styles from "./collapseParagraph.module.css";

const { Paragraph } = Typography;

export interface CollapseParagraphProps {
    value: ReactNode;
    topic?: string;
    rows?: number;
    isLine?: boolean; // 展开收起是否单行显示
    isTopicLine?: boolean; // 话题是否单行显示
    valueConfig?: ParagraphProps;
}

export const CollapseParagraph: React.FC<CollapseParagraphProps> = (props) => {
    const {
        value,
        topic = "",
        rows = 1,
        isLine,
        isTopicLine,
        valueConfig,
    } = props;

    const [key, setKey] = useState(0);
    const [fold, setFold] = useState(true);

    const onExpand = () => setFold(false);

    const onCollapse = () => {
        setFold(true);
        setKey(key + 1);
    };
    return (
        <div key={key}>
            <Paragraph
                ellipsis={{
                    rows: !!isLine ? rows + 2 : rows,
                    expandable: true,
                    onExpand: onExpand,
                    symbol: !!isLine ? (
                        <div
                            className={styles["collapse-paragraph-expand-btn"]}
                        >
                            展开
                        </div>
                    ) : (
                        <span
                            className={styles["collapse-paragraph-expand-btn"]}
                        >
                            展开
                        </span>
                    ),
                }}
                {...valueConfig}
                className={`${styles["collapse-paragraph"]} ${
                    valueConfig?.className || ""
                }`}
            >
                {isTopicLine ? (
                    <></>
                ) : (
                    topic && (
                        <span
                            className={styles["collapse-paragraph-topic-style"]}
                        >
                            #{topic}&nbsp;&nbsp;
                        </span>
                    )
                )}

                {value}

                {!!isLine && !fold && (
                    <div
                        className={styles["collapse-paragraph-collapse-btn"]}
                        onClick={onCollapse}
                    >
                        收起
                    </div>
                )}
                {!isLine && !fold && (
                    <span
                        className={styles["collapse-paragraph-collapse-btn"]}
                        onClick={onCollapse}
                    >
                        收起
                    </span>
                )}
            </Paragraph>

            {isTopicLine && (
                <div className={styles["collapse-paragraph-topic-style"]}>
                    #{topic}
                </div>
            )}
        </div>
    );
};
