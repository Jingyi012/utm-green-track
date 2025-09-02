'use client'
import { EnquiryStatus, enquiryStatusLabels } from "@/lib/enum/status";
import { createEnquiry, deleteEnquiry, getAllEnquiry, updateEnquiryStatus } from "@/lib/services/enquiry";
import { Enquiry, EnquiryInput } from "@/lib/types/typing";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Button, Popconfirm, Space } from "antd";
import { useState, useRef } from "react"
import { EnquiryDetailDrawer } from "./EnquiryDetailDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { CreateEnquiryModal } from "./CreateEnquiryModal";
import { PlusOutlined } from "@ant-design/icons";
import { dateTimeFormatter } from "@/lib/utils/formatter";

export const EnquiryList: React.FC = () => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<string>();
    const [enqruiyList, setEnquiryList] = useState<Enquiry[]>([]);
    const [createModalOpen, setCreateModalOpen] = useState<boolean>();
    const actionRef = useRef<ActionType | undefined>(undefined);
    const { user, hasRole } = useAuth();

    const fetchData = async (params: {
        pageNumber: number,
        pageSize: number,
        status?: number,
        subject?: string
    }) => {
        try {
            setLoading(true);
            var res = await getAllEnquiry(params);
            if (res.success) {
                setEnquiryList(res.data);
                return {
                    data: res.data ?? [],
                    success: res.success,
                    total: res.totalCount
                }
            } else {
                message.error(res.message || 'Failed to fetch enquiry list');
                return {
                    data: [],
                    success: false,
                    total: 0
                }
            }

        } catch (err) {
            message.error(err?.response?.data?.message || 'Failed to fetch enquiry list');
            return {
                data: [],
                success: false,
                total: 0
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteEnquiry = async (id: string) => {
        try {
            const res = await deleteEnquiry(id);
            if (res.success) {
                message.success("Enquiry deleted successfully");
                actionRef?.current?.reload();
            } else {
                message.error("Failed to delete enquiry");
            }
        }
        catch (err) {
            message.error("Failed to delete enquiry");
        }
    }

    const columns: ProColumns<Enquiry>[] = [
        {
            title: 'No',
            render: (_: any, __: any, index: number, action) => {
                const current = action?.pageInfo?.current ?? 1;
                const pageSize = action?.pageInfo?.pageSize ?? 10;
                return (current - 1) * pageSize + index + 1;
            },
            width: 60,
            align: 'center' as const,
            hideInSearch: true,
        },
        {
            title: 'User',
            dataIndex: 'userName',
            align: 'center' as const,
            hideInSearch: true,
            hideInTable: !hasRole('Admin')
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            align: 'center' as const,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            align: 'center' as const,
            valueType: 'select',
            valueEnum: {
                [EnquiryStatus.Open]: {
                    text: enquiryStatusLabels[EnquiryStatus.Open],
                    status: "Processing"
                },
                [EnquiryStatus.Closed]: {
                    text: enquiryStatusLabels[EnquiryStatus.Closed],
                    status: "Default"
                },
            }
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            align: 'center' as const,
            hideInSearch: true,
            render(_, record) {
                return dateTimeFormatter(record.createdAt);
            },
        },
        {
            title: 'Action',
            hideInSearch: true,
            align: 'center' as const,
            render: (_, record: Enquiry) => (
                <Space size="middle">
                    <Button
                        type="link"
                        onClick={() => setSelectedId(record.id)}
                    >
                        View </Button>

                    {record.status === EnquiryStatus.Open && hasRole('Admin') && (
                        <Button
                            variant="link"
                            color="cyan"
                            onClick={() => handleEnquiryStatusUpdate(record.id, EnquiryStatus.Closed)}
                        > Close </Button>
                    )}

                    {record.status === EnquiryStatus.Closed && hasRole('Admin') && (
                        <Button
                            variant="link"
                            color="orange"
                            onClick={() => handleEnquiryStatusUpdate(record.id, EnquiryStatus.Open)}
                        > Reopen </Button>
                    )}

                    <Popconfirm
                        title="Are you sure you want to delete this enquiry?"
                        onConfirm={() => handleDeleteEnquiry(record.id)}
                    >
                        <Button type="link" danger > Delete </Button>
                    </Popconfirm>
                </Space>
            ),
        }

    ]

    const handleCreateEnquiry = async (values: EnquiryInput) => {
        const hide = message.loading("Creating enquiry...", 0);
        try {
            const res = await createEnquiry({
                subject: values.subject,
                message: values.message,
            });
            if (res.success) {
                if (actionRef.current) {
                    actionRef.current.reload();
                }
                message.success("Enquiry created successfully");
                setCreateModalOpen(false);
                return true;
            } else {
                message.error("Failed to create enquiry");
                return false;
            }
        } catch (err) {
            message.error("Failed to create enquiry");
        } finally {
            hide();
        }
    }

    const handleEnquiryStatusUpdate = async (id: string, status: number) => {
        try {
            const res = await updateEnquiryStatus({
                enquiryId: id,
                status,
            });
            if (res.success) {
                if (actionRef.current) {
                    actionRef.current.reload();
                }
                message.success("Enquiry status updated successfully");
                return true;
            } else {
                message.error("Failed to update enquiry status");
                return false;
            }
        } catch (err) {
            message.error("Failed to update enquiry status");
        } finally {

        }
    }

    return (
        <>
            <ProTable<Enquiry>
                rowKey="id"
                headerTitle="Enquiry List"
                actionRef={actionRef}
                loading={loading}
                columns={columns}
                dataSource={enqruiyList}
                pagination={{
                    pageSize: 20,
                }}
                request={(params: any) => {
                    return fetchData({
                        pageNumber: params.current ?? 1,
                        pageSize: params.pageSize ?? 20,
                        status: params.status,
                        subject: params.subject
                    });
                }}
                search={{
                    labelWidth: 'auto',
                }}
                toolBarRender={() => [
                    <Button
                        type="primary"
                        key="primary"
                        onClick={() => {
                            setCreateModalOpen(true);
                        }}
                    >
                        <PlusOutlined /> New
                    </Button>,
                ]}
            />

            <EnquiryDetailDrawer
                enquiryId={selectedId}
                open={!!selectedId}
                onClose={() => setSelectedId(null)}
                currentUserId={user?.id ?? ""}
                updateStatus={handleEnquiryStatusUpdate}
            />;

            <CreateEnquiryModal
                onCancel={() => {
                    setCreateModalOpen(false);
                }}
                onSubmit={handleCreateEnquiry}
                visible={createModalOpen} />
        </>
    )
}
