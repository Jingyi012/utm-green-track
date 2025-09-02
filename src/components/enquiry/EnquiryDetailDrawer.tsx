'use client';

import React, { useEffect, useState } from 'react';
import { Drawer, List, Input, Button, Tag, Spin, App, theme } from 'antd';
import { EnquiryDetails } from '@/lib/types/typing';
import { getEnquiryById, replyEnquiry } from '@/lib/services/enquiry';
import { EnquiryStatus, enquiryStatusLabels } from '@/lib/enum/status';
import { useAuth } from '@/contexts/AuthContext';
import { dateTimeFormatter } from '@/lib/utils/formatter';

interface EnquiryDetailDrawerProps {
    enquiryId: string | null;
    open: boolean;
    onClose: () => void;
    currentUserId: string;
    updateStatus: (id: string, status: number) => Promise<boolean>;
}

export const EnquiryDetailDrawer: React.FC<EnquiryDetailDrawerProps> = ({
    enquiryId,
    open,
    onClose,
    currentUserId,
    updateStatus
}) => {
    const {
        token: { colorPrimary },
    } = theme.useToken();
    const { hasRole } = useAuth();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [details, setDetails] = useState<EnquiryDetails | null>(null);
    const [reply, setReply] = useState('');


    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await getEnquiryById(enquiryId);
            if (res.success) {
                setDetails(res.data);
            } else {
                message.error(res.message || 'Failed to fetch enquiry details');
            }
        } catch (err) {
            message.error(err?.response?.data?.message || 'Failed to fetch enquiry details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && enquiryId) {
            fetchDetails();
        }
    }, [open, enquiryId]);

    const handleSend = async () => {
        try {
            setSendLoading(true);
            if (!reply.trim() || !enquiryId) return;

            const res = await replyEnquiry({
                enquiryId,
                message: reply,
            });

            if (res.success) {
                fetchDetails();
                setReply('');
            } else {
                message.error(res.message || 'Failed to reply, please try again');
            }
        } catch (err) {
            message.error('Failed to reply, please try again');
        } finally {
            setSendLoading(false);
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
                                        const newStatus = details.status === EnquiryStatus.Open ? EnquiryStatus.Closed : EnquiryStatus.Open;
                                        await updateStatus(details.id, newStatus);
                                        setDetails({ ...details, status: newStatus });
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
