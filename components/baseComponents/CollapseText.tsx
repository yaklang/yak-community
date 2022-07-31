import React, { ReactNode, useEffect, useRef, useState } from "react";

export interface CollapseTextProps {
    rows?: number;
    isComment?: boolean;
    value: ReactNode;
}

export const CollapseText: React.FC<CollapseTextProps> = (props) => {
    const { rows = 3, isComment = false, value } = props;
    const lineHeight = isComment ? 17 : 24;

    const divRef = useRef<HTMLDivElement>(null);

    const [isExpand, setIsExpand] = useState<boolean>(false);
    const [fold, setFold] = useState(true);

    const setTextOffset = () => {
        if (!divRef || !divRef.current) return;
        const div = divRef.current;
        const { offsetHeight, scrollHeight } = div;
        setIsExpand(scrollHeight > offsetHeight);
    };

    useEffect(() => {
        const time = setInterval(() => {
            if (!divRef || !divRef.current) return;
            const div = divRef.current;
            const { offsetHeight, scrollHeight } = div;
            if (!offsetHeight || !scrollHeight) return;
            else {
                setTextOffset();
                clearInterval(time);
            }
        }, 50);
    }, []);

    return (
        <div className="collapse-text-wrapper">
            <div
                ref={divRef}
                style={{
                    maxHeight: isExpand
                        ? fold
                            ? rows * lineHeight
                            : "100%"
                        : rows * lineHeight,
                }}
                className={`collapse-text-body ${
                    isComment ? "comment-text-style" : "dynamic-text-style"
                }`}
            >
                {value}
            </div>
            {isExpand && (
                <div
                    className="expand-text-style"
                    style={{
                        height: lineHeight,
                        lineHeight: `${lineHeight}px`,
                    }}
                >
                    <span onClick={() => setFold(!fold)}>
                        {fold ? "展开" : "收起"}
                    </span>
                </div>
            )}
        </div>
    );
};
