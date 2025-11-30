import { ReactNode } from "react";

export const WhiteBgWrapper = (children: any) => {
    return <div
        style={{
            background: 'white',
            borderRadius: 8,
            padding: 24,
            minHeight: '400px',
        }}
    >
        {children}
    </div>
}