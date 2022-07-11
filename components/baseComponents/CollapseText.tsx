import React, { ReactNode, useEffect, useRef, useState } from "react";

export interface CollapseTextProps {
    value: ReactNode;
    rows?: number;
}

export const CollapseText: React.FC<CollapseTextProps> = (props) => {
    const { value, rows = 3 } = props;

    const divRef = useRef<HTMLDivElement>(null);

    const [key, setKey] = useState(0);
    const [fold, setFold] = useState(true);

    const onExpand = () => setFold(false);

    const onCollapse = () => {
        setFold(true);
        setKey(key + 1);
    };

    useEffect(() => {
        if (!divRef || !divRef.current) return;
        console.log([divRef.current]);
    }, []);

    return (
        <div className="collapse-text-wrapper">
            <div ref={divRef} className="collapse-text-body">
                {value}
            </div>
            {/* <div></div> */}
        </div>
    );
};
