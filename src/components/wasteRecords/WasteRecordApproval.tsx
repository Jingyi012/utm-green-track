'use client';

import { useWasteRecordDropdownOptions } from "@/hook/options";
import { wasteRecordStatusLabels, WasteRecordStatus } from "@/lib/enum/status";
import { getWasteRecordsPaginated, updateWasteRecordApprovalStatus } from "@/lib/services/wasteRecord";
import { WasteRecord, WasteRecordFilter } from "@/lib/types/wasteRecord";
import { ActionType, FooterToolbar, ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Button, Popconfirm, Tabs, Tooltip } from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useState, useEffect, useRef } from "react";

const WasteRecordApproval: React.FC = () => {
    const { message } = App.useApp();
    const { campuses, disposalMethods, isLoading } = useWasteRecordDropdownOptions();
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPagesize] = useState<number>(20);
    const [data, setData] = useState<WasteRecord[]>([]);
    const [statusFilter, setStatusFilter] = useState<WasteRecordStatus>(WasteRecordStatus.New);
    const [selectedRows, setSelectedRows] = useState<WasteRecord[]>([]);
    const actionRef = useRef<ActionType | undefined>(undefined);

    const fetchData = async (filter: WasteRecordFilter) => {
        setLoading(true);
        try {
            const res = await getWasteRecordsPaginated({
                ...filter,
            });
            setData(res.data || []);
            setPage(res.pageNumber);
            setPagesize(res.pageSize);
            return {
                data: res.data,
                success: res.success,
                total: res.totalCount
            }
        } catch (err) {
            message.error("Failed to fetch waste records");
            setData([]);
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
    const handleStatusUpdate = async (records: WasteRecord[], status: WasteRecordStatus) => {
        if (!records.length) return;
        try {
            const wasteRecordIds = records.map(u => u.id);
            const res = await updateWasteRecordApprovalStatus({ wasteRecordIds, status });
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

    const columns: ProColumns[] = [
        {
            title: 'No.',
            render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
            width: 60,
            align: 'center' as const,
            hideInSearch: true,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            render: (_: any, record: WasteRecord) => new Date(record.date).toLocaleDateString('en-GB'),
            align: 'center' as const,
            hideInSearch: true,
        },
        {
            title: 'UTM Campus',
            dataIndex: 'campus',
            valueEnum: campuses.reduce((acc, campus) => {
                acc[campus.name] = { text: campus.name };
                return acc;
            }, {} as Record<string, { text: string }>),
            render: (_: any, record: WasteRecord) => record.campus,
            align: 'center' as const
        },
        {
            title: 'Location',
            dataIndex: 'location',
            align: 'center' as const,
            hideInSearch: true,
        },
        {
            title: 'Disposal Method',
            dataIndex: 'disposalMethod',
            valueEnum: disposalMethods.reduce((acc, method) => {
                acc[method.name] = { text: method.name };
                return acc;
            }, {} as Record<string, { text: string }>),
            render: (_: any, record: WasteRecord) => record.disposalMethod,
            align: 'center' as const
        },
        {
            title: 'Waste Type',
            dataIndex: 'wasteType',
            valueEnum: Array.from(
                new Set(
                    disposalMethods.flatMap(method =>
                        method.wasteTypes.map(waste => waste.name)
                    )
                )
            ).reduce((acc, name) => {
                acc[name] = { text: name };
                return acc;
            }, {} as Record<string, { text: string }>),
            render: (_: any, record: WasteRecord) => record.wasteType,
            align: 'center' as const
        },
        {
            title: 'Waste Weight (kg)',
            dataIndex: 'wasteWeight',
            align: 'center' as const,
            hideInSearch: true,
        },
        {
            title: 'Attachment',
            dataIndex: 'attachments',
            render: (_: any, record: WasteRecord) => {
                const attachments = Array.isArray(record.attachments) ? record.attachments : [];

                if (attachments.length === 0) return '-';

                return attachments.map((file, index) => (
                    <Tooltip title="View Attachment" key={index}>
                        <a href={file.filePath} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}>
                            {file.fileName}
                        </a>
                    </Tooltip>
                ));
            },
            hideInSearch: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            hideInSearch: true,
            valueEnum: {
                [WasteRecordStatus.New]: {
                    text: wasteRecordStatusLabels[WasteRecordStatus.New],
                    status: 'Default',
                },
                [WasteRecordStatus.Verified]: {
                    text: wasteRecordStatusLabels[WasteRecordStatus.Verified],
                    status: 'Success',
                },
                [WasteRecordStatus.Rejected]: {
                    text: wasteRecordStatusLabels[WasteRecordStatus.Rejected],
                    status: 'Error',
                },
            },
            align: 'center' as const,
        },
        {
            title: 'Date Range',
            dataIndex: 'date',
            valueType: 'dateRange',
            hideInTable: true,
            fieldProps: {
                format: 'YYYY-MM-DD',
            },
            search: {
                transform: (value: any) => {
                    if (value && value.length === 2) {
                        const start = new Date(value[0]);
                        const end = new Date(value[1]);
                        end.setHours(23, 59, 59, 999);

                        return {
                            fromDate: start.toISOString(),
                            toDate: end.toISOString(),
                        };
                    }
                    return {};
                }
            }
        },
        {
            title: "Action",
            align: "center",
            hideInSearch: true,
            render: (_, record) => {
                if (record.status === WasteRecordStatus.New) {
                    return (
                        <>
                            <Button
                                type="link"
                                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
                                loading={loading}
                            >
                                Verify
                            </Button>
                            <Popconfirm
                                title="Reject this record?"
                                onConfirm={() => handleStatusUpdate([record], WasteRecordStatus.Rejected)}
                            >
                                <Button type="link" danger loading={loading}>
                                    Reject
                                </Button>
                            </Popconfirm>
                        </>
                    );
                }
                else if (record.status === WasteRecordStatus.Verified) {
                    return (
                        <>
                            <Popconfirm
                                title="Reject this record?"
                                onConfirm={() => handleStatusUpdate([record], WasteRecordStatus.Rejected)}
                            >
                                <Button type="link" danger loading={loading}>
                                    Reject
                                </Button>
                            </Popconfirm>
                        </>
                    );
                }
                else if (record.status === WasteRecordStatus.Rejected) {
                    return (
                        <>
                            <Button
                                type="link"
                                onClick={() => handleStatusUpdate([record], WasteRecordStatus.Verified)}
                                loading={loading}
                            >
                                Verify
                            </Button>

                        </>
                    );
                }
                return "-";
            },
        },
    ];

    useEffect(() => {
        actionRef.current?.reload();
    }, [statusFilter])

    return (
        <>
            <Tabs
                activeKey={statusFilter.toString()}
                onChange={(key) => {
                    setStatusFilter(parseInt(key) as WasteRecordStatus);
                    setSelectedRows([]);
                    setPage(1);
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
                ]}
            />

            <ProTable<WasteRecord>
                rowKey="id"
                headerTitle="Waste Record List"
                actionRef={actionRef}
                loading={loading || isLoading}
                columns={columns}
                dataSource={data}
                pagination={{
                    current: page,
                    pageSize,
                    onChange: (p, ps) => {
                        setPage(p);
                        setPagesize(ps);
                    },
                }}
                request={(params: any, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
                    return fetchData({
                        pageNumber: params.current ?? 1,
                        pageSize: params.pageSize ?? 20,
                        campus: params.campus,
                        disposalMethod: params.disposalMethod,
                        wasteType: params.wasteType,
                        status: statusFilter,
                        fromDate: params.fromDate,
                        toDate: params.toDate,
                        isAdmin: true
                    });
                }}
                search={{
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
        </>
    );
};

export default WasteRecordApproval;
