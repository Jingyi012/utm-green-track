"use client"
import { App } from 'antd';

export function confirmAction({
    title,
    content,
    okText = 'Yes',
    cancelText = 'Cancel',
}: {
    title: string;
    content: string;
    okText?: string;
    cancelText?: string;
}): Promise<boolean> {
    const { modal } = App.useApp();
    return new Promise((resolve) => {
        modal.confirm({
            title,
            content,
            okText,
            cancelText,
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
        });
    });
}