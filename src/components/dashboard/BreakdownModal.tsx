'use client';

import { Modal } from 'antd';
import type { ReactNode } from 'react';

export function BreakdownModal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}) {
    return (
        <Modal
            title={title}
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            {children}
        </Modal>
    );
}
