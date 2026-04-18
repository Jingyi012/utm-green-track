import { Button, Modal } from 'antd';
import { useState } from 'react';
import { MessageOutlined } from '@ant-design/icons';
import { TableActionButton } from '@/components/table/TableAction';

export const CommentButton: React.FC<{ comment?: string }> = ({ comment }) => {
    const [visible, setVisible] = useState(false);

    if (!comment) return null;

    return (
        <>
            <TableActionButton
                tone="default"
                icon={<MessageOutlined />}
                onClick={() => setVisible(true)}
            >
                View Comment
            </TableActionButton>

            <Modal
                title="Comment"
                open={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
                okText="Close"
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <p>{comment}</p>
            </Modal>
        </>
    );
};
