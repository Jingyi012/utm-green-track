'use client';

import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from "@/hook/options";
import { wasteRecordStatusLabels, WasteRecordStatus } from "@/lib/enum/status";
import { getWasteRecordsPaginated, updateWasteRecordApprovalStatus } from "@/lib/services/wasteRecord";
import { WasteRecord, WasteRecordFilter } from "@/lib/types/wasteRecord";
import { ActionType, FooterToolbar, ModalForm, ProColumns, ProFormTextArea, ProTable } from "@ant-design/pro-components";
import { App, Button, Tabs } from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useState, useEffect, useRef } from "react";
import { CommentButton } from "./CommentButton";
import { getBaseColumns } from './columns';

const WasteRecordApproval: React.FC = () => {
    const { message } = App.useApp();
    const { departments } = useProfileDropdownOptions();
    const { campuses, disposalMethods, isLoading } = useWasteRecordDropdownOptions();
    const [loading, setLoading] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<WasteRecordStatus>(WasteRecordStatus.New);
    const [selectedRows, setSelectedRows] = useState<WasteRecord[]>([]);
    const actionRef = useRef<ActionType | undefined>(undefined);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState<WasteRecordStatus | null>(null);
    const [modalRecords, setModalRecords] = useState<WasteRecord[]>([]);

    const fetchData = async (filter: WasteRecordFilter) => {
        setLoading(true);
        try {
            const res = await getWasteRecordsPaginated({
                ...filter,
            });
            return {
                data: res.data,
                success: res.success,
                total: res.totalCount
            }
        } catch (err) {
            message.error("Failed to fetch waste records");
            return {
                data: [],
                success: false,
                total: 0
            }
        } finally {
            setLoading(false);
        }
    };

    // Batch or single approve/reject
    const handleStatusUpdate = async (records: WasteRecord[], status: WasteRecordStatus, comment?: string) => {
        if (!records.length) return;
        try {
            const wasteRecordIds = records.map(u => u.id);
            const res = await updateWasteRecordApprovalStatus({ wasteRecordIds, status, comment });
            if (res.success) {
                message.success(`Waste record status updated to ${wasteRecordStatusLabels[status]}`);
            } else {
                message.error(`Failed to update status to ${wasteRecordStatusLabels[status]}`);
            }
            setSelectedRows([]);
            actionRef.current?.reload();
        } catch {
            message.error(`Failed to update status to ${wasteRecordStatusLabels[status]}`);
        }
    };

    const columns: ProColumns<WasteRecord>[] = [
        ...getBaseColumns({ campuses, departments, disposalMethods }),
        {
            title: "Action",
            align: "center",
            hideInSearch: true,
            render: (_, record) => {
                const openCommentModal = (status: WasteRecordStatus) => {
                    setModalStatus(status);
                    setModalRecords([record]);
                    setModalOpen(true);
                };

                if (record.status === WasteRecordStatus.New) {
                    return (
                        <>
                            <Button
                                type="link"
                                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
                            >
                                Verify
                            </Button>

                            {/* Reject → needs comment */}
                            <Button
                                type="link"
                                danger
                                onClick={() => openCommentModal(WasteRecordStatus.Rejected)}
                            >
                                Reject
                            </Button>

                            {/* Revision Required → needs comment */}
                            <Button
                                type="link"
                                style={{ color: '#fa8c16' }}
                                onClick={() => openCommentModal(WasteRecordStatus.RevisionRequired)}
                            >
                                Revision
                            </Button>
                        </>
                    );
                }

                if (record.status === WasteRecordStatus.Verified) {
                    return (
                        <>
                            <Button
                                type="link"
                                style={{ color: '#fa8c16' }}
                                onClick={() => openCommentModal(WasteRecordStatus.RevisionRequired)}
                            >
                                Revision
                            </Button>
                            <Button
                                type="link"
                                danger
                                onClick={() => openCommentModal(WasteRecordStatus.Rejected)}
                            >
                                Reject
                            </Button>
                        </>
                    );
                }

                if (record.status === WasteRecordStatus.Rejected) {
                    return (
                        <>
                            <Button
                                type="link"
                                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
                            >
                                Verify
                            </Button>
                            <Button
                                type="link"
                                style={{ color: '#fa8c16' }}
                                onClick={() => openCommentModal(WasteRecordStatus.RevisionRequired)}
                            >
                                Revision
                            </Button>
                            <CommentButton comment={record.comment} />
                        </>
                    );
                }

                if (record.status === WasteRecordStatus.RevisionRequired) {
                    return (
                        <>
                            <Button
                                type="link"
                                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
                            >
                                Verify
                            </Button>
                            <Button
                                type="link"
                                danger
                                onClick={() => openCommentModal(WasteRecordStatus.Rejected)}
                            >
                                Reject
                            </Button>
                            <CommentButton comment={record.comment} />
                        </>
                    );
                }

                return "-";
            },
        },
    ];

    useEffect(() => {
        actionRef.current?.reloadAndRest?.();
    }, [statusFilter])

    return (
        <>
            <Tabs
                activeKey={statusFilter.toString()}
                onChange={(key) => {
                    setStatusFilter(parseInt(key) as WasteRecordStatus);
                    setSelectedRows([]);
                }}
                style={{ marginBottom: 16 }}
                items={[
                    {
                        key: WasteRecordStatus.New.toString(),
                        label: wasteRecordStatusLabels[WasteRecordStatus.New],
                    },
                    {
                        key: WasteRecordStatus.Verified.toString(),
                        label: wasteRecordStatusLabels[WasteRecordStatus.Verified],
                    },
                    {
                        key: WasteRecordStatus.Rejected.toString(),
                        label: wasteRecordStatusLabels[WasteRecordStatus.Rejected],
                    },
                    {
                        key: WasteRecordStatus.RevisionRequired.toString(),
                        label: wasteRecordStatusLabels[WasteRecordStatus.RevisionRequired],
                    },
                ]}
            />

            <ProTable<WasteRecord>
                rowKey="id"
                headerTitle="Waste Record List"
                actionRef={actionRef}
                loading={loading || isLoading}
                columns={columns}
                pagination={{ showSizeChanger: true }}
                request={(params: any, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
                    return fetchData({
                        ...params,
                        pageNumber: params.current ?? 1,
                        pageSize: params.pageSize ?? 20,
                        status: statusFilter,
                        isAdmin: true
                    });
                }}
                search={{
                    layout: 'vertical',
                    labelWidth: 'auto',
                }}
                rowSelection={
                    statusFilter === WasteRecordStatus.New
                        ? {
                            onChange: (_, selectedRows) => setSelectedRows(selectedRows),
                        }
                        : undefined
                }
            />

            {/* Batch approve toolbar */}
            {statusFilter === WasteRecordStatus.New && selectedRows.length > 0 && (
                <FooterToolbar
                    extra={
                        <div>
                            Chosen <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> item
                        </div>
                    }
                >
                    <Button
                        onClick={async () => handleStatusUpdate(selectedRows, WasteRecordStatus.Verified)}
                    >
                        Batch Approve
                    </Button>
                </FooterToolbar>
            )}

            <ModalForm
                title={
                    modalStatus === WasteRecordStatus.Rejected
                        ? "Reject Record"
                        : "Request Revision"
                }
                modalProps={{
                    destroyOnClose: true,
                }}
                open={modalOpen}
                onOpenChange={setModalOpen}
                onFinish={async (values) => {
                    await handleStatusUpdate(modalRecords, modalStatus!, values.comment);
                    return true;
                }}
                submitter={{
                    searchConfig: {
                        submitText: 'Submit',
                    },
                }}
            >
                <ProFormTextArea
                    name="comment"
                    label="Comment"
                    placeholder="Please enter a reason"
                    rules={[{ required: true, message: "Comment is required" }]}
                />
            </ModalForm>

        </>
    );
};

export default WasteRecordApproval;
