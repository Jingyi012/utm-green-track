import { Button, Modal } from 'antd';
import { useState } from 'react';

export const CommentButton: React.FC<{ comment?: string }> = ({ comment }) => {
    const [visible, setVisible] = useState(false);

    if (!comment) return null;

    return (
        <>
            <Button type="link" size="small" onClick={() => setVisible(true)}>
                View Comment
            </Button>

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
