import { App } from 'antd';

export function useConfirmAction() {
    const { modal } = App.useApp();

    return function confirmAction({
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
            modal.confirm({
                title,
                content,
                okText,
                cancelText,
                onOk: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    };
}