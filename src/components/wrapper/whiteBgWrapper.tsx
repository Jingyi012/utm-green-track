import { ReactNode } from "react";

export const WhiteBgWrapper = ({ children }: { children: ReactNode }) => {
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
