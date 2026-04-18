import React, { useEffect, useState } from 'react';
import { Drawer, List, Input, Button, Tag, Spin, theme } from 'antd';
import { EnquiryStatus, enquiryStatusLabels } from '@/lib/enum/status';
import { useAuth } from '@/contexts/AuthContext';
import { dateTimeFormatter } from '@/lib/utils/formatter';
import { useEnquiryDetail, useReplyEnquiry } from '@/hook/enquiry';

interface EnquiryDetailDrawerProps {
  enquiryId: string | null;
  open: boolean;
  onClose: () => void;
  currentUserId: string;
  updateStatus: (id: string, status: number) => Promise<void> | void;
}

export const EnquiryDetailDrawer: React.FC<EnquiryDetailDrawerProps> = ({
  enquiryId,
  open,
  onClose,
  currentUserId,
  updateStatus,
}) => {
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const { hasRole } = useAuth();
  const [reply, setReply] = useState('');
  const { data: details, isLoading: loading, refetch } = useEnquiryDetail(enquiryId, open);
  const { mutateAsync: replyToEnquiry, isPending: sendLoading } = useReplyEnquiry();

  useEffect(() => {
    if (!open) {
      setReply('');
    }
  }, [open]);

  const handleSend = async () => {
    if (!reply.trim() || !enquiryId) {
      return;
    }

    try {
      await replyToEnquiry({
        enquiryId,
        message: reply,
      });
      await refetch();
      setReply('');
    } catch {
      return;
    }
  };

  return (
    <Drawer
      title={
        details ? (
          <div className="flex justify-between items-center w-full">
            <span>{details.subject}</span>
            <div className="flex items-center gap-2">
              <Tag color={details.status === EnquiryStatus.Open ? 'blue' : 'default'}>
                {enquiryStatusLabels[details.status]}
              </Tag>
              {hasRole('Admin') && (
                <Button
                  size="small"
                  onClick={async () => {
                    const newStatus =
                      details.status === EnquiryStatus.Open
                        ? EnquiryStatus.Closed
                        : EnquiryStatus.Open;
                    await updateStatus(details.id, newStatus);
                    await refetch();
                  }}
                >
                  {details.status === EnquiryStatus.Open ? 'Close' : 'Reopen'}
                </Button>
              )}
            </div>
          </div>
        ) : (
          'Enquiry Details'
        )
      }
      open={open}
      onClose={onClose}
      width={500}
      footer={
        details && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Input.TextArea
              rows={2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              disabled={details.status === EnquiryStatus.Closed}
            />
            <Button
              type="primary"
              loading={sendLoading}
              onClick={handleSend}
              disabled={details.status === EnquiryStatus.Closed}
            >
              Send
            </Button>
          </div>
        )
      }
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin />
        </div>
      ) : details ? (
        <List
          dataSource={details.messages}
          renderItem={(item) => {
            const isCurrentUser = item.senderId === currentUserId;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background: isCurrentUser ? colorPrimary : '#f5f5f5',
                    color: isCurrentUser ? '#fff' : '#000',
                    padding: '8px 12px',
                    borderRadius: 8,
                    maxWidth: '70%',
                  }}
                >
                  {!isCurrentUser && (
                    <div
                      style={{
                        fontSize: 12,
                        marginBottom: 4,
                        fontWeight: 500,
                      }}
                    >
                      {item.senderName}
                    </div>
                  )}
                  <div>{item.message}</div>
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>
                    {dateTimeFormatter(item.createdAt)}
                  </div>
                </div>
              </div>
            );
          }}
        />
      ) : (
        <p>No enquiry data found.</p>
      )}
    </Drawer>
  );
};
