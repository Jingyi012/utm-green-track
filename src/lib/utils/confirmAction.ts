import { Modal } from 'antd';

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
    return new Promise((resolve) => {
        Modal.confirm({
            title,
            content,
            okText,
            cancelText,
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
        });
    });
}