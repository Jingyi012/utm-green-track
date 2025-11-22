'use client';

import { RequestStatus, requestStatusLabels } from "@/lib/enum/status";
import { getAllRequest, updateRequestResolveStatus } from "@/lib/services/requestService";
import { ChangeRequest } from "@/lib/types/typing";
import { dateFormatter, dateTimeFormatter } from "@/lib/utils/formatter";
import { EyeOutlined } from "@ant-design/icons";
import { ActionType, FooterToolbar, ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Button, Descriptions, Popconfirm, Tabs } from "antd";
import { SortOrder } from "antd/es/table/interface";
import Popover from "antd/lib/popover";
import { useState, useRef, useEffect } from "react";

const RequestManagement: React.FC = () => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedRows, setSelectedRows] = useState<ChangeRequest[]>([]);
    const actionRef = useRef<ActionType | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<RequestStatus>(RequestStatus.Pending);

    // Fetch requests based on status, page, pageSize
    const fetchData = async (filter: {
        pageNumber: number,
        pageSize: number,
        matricNo?: string,
        status?: number,
    }) => {
        setLoading(true);
        try {
            const res = await getAllRequest({
                ...filter,
            });
            return {
                data: res.data,
                success: res.success,
                total: res.totalCount
            }
        } catch (err) {
            message.error("Failed to fetch requests");
            return {
                data: [],
                success: false,
                total: 0
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (request: ChangeRequest[], status: RequestStatus) => {
        if (!request.length) return;
        try {
            const requestIds = request.map(u => u.id);
            const res = await updateRequestResolveStatus({ requestIds, status });
            if (res.success) {
                message.success(`Request status updated to ${requestStatusLabels[status]}`);
            } else {
                message.error(`Failed to update status to ${requestStatusLabels[status]}`);
            }
            setSelectedRows([]);
            actionRef.current?.reload();
        } catch {
            message.error(`Failed to update status to ${requestStatusLabels[status]}`);
        }
    };


    const columns: ProColumns<ChangeRequest>[] = [
        {
            title: "No.",
            render: (_: any, __: any, index: number, action) => {
                const current = action?.pageInfo?.current ?? 1;
                const pageSize = action?.pageInfo?.pageSize ?? 10;
                return (current - 1) * pageSize + index + 1;
            },
            width: 60,
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'User',
            dataIndex: 'user', align: "center",
            hideInSearch: true
        },
        {
            title: 'Staff/Matric No.',
            dataIndex: 'matricNo', align: "center",
        },
        {
            title: 'Message',
            dataIndex: 'message', align: "center",
            hideInSearch: true
        },
        {
            title: 'Related Waste Record',
            dataIndex: 'wasteRecord',
            align: "center",
            hideInSearch: true,
            render: (_: any, record: ChangeRequest) => {
                const wr = record.wasteRecord;
                if (!wr) return "-";

                const content = (
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Campus">{wr.campus}</Descriptions.Item>
                        <Descriptions.Item label="Department">{wr.department}</Descriptions.Item>
                        <Descriptions.Item label="Disposal Method">{wr.disposalMethod}</Descriptions.Item>
                        <Descriptions.Item label="Waste Type">{wr.wasteType}</Descriptions.Item>
                        <Descriptions.Item label="Location">{wr.location || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Unit">{wr.unit || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Program">{wr.program || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Program Date">{dateTimeFormatter(wr.programDate) || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Waste Weight">{wr.wasteWeight}</Descriptions.Item>
                        <Descriptions.Item label="Status">{requestStatusLabels[wr.status]}</Descriptions.Item>
                        <Descriptions.Item label="Date">{dateFormatter(wr.date)}</Descriptions.Item>
                        <Descriptions.Item label="Attachments">
                            {wr.attachments?.length
                                ? wr.attachments.map(a => <a href={a.filePath} target="_blank" rel="noopener noreferrer" key={a.id}>{a.fileName}</a>)
                                : "-"}
                        </Descriptions.Item>
                    </Descriptions>
                );

                return (
                    <Popover content={content} title="Waste Record Details" trigger="click"
                        arrow={false}
                    >
                        <Button type="link" icon={<EyeOutlined />}>View Details</Button>
                    </Popover>
                );
            }
        },
        {
            title: "Status",
            dataIndex: "status",
            align: "center",
            hideInSearch: true,
            valueEnum: {
                [RequestStatus.Pending]: {
                    text: requestStatusLabels[RequestStatus.Pending],
                    status: "Default",
                },
                [RequestStatus.Approved]: {
                    text: requestStatusLabels[RequestStatus.Approved],
                    status: "Success",
                },
                [RequestStatus.Rejected]: {
                    text: requestStatusLabels[RequestStatus.Rejected],
                    status: "Error",
                },
            },
        },
        {
            title: "Action",
            align: "center",
            hideInSearch: true,
            render: (_, record) => {
                if (record.status === RequestStatus.Pending) {
                    return (
                        <>
                            <Button
                                type="link"
                                onClick={() => handleStatusUpdate([record], RequestStatus.Approved)}
                                loading={loading}
                            >
                                Approve
                            </Button>
                            <Popconfirm
                                title="Reject this request?"
                                onConfirm={() => handleStatusUpdate([record], RequestStatus.Rejected)}
                            >
                                <Button type="link" danger loading={loading}>
                                    Reject
                                </Button>
                            </Popconfirm>
                        </>
                    );
                }
                else {
                    return (
                        <>
                            <Button
                                type="link"
                                onClick={() => handleStatusUpdate([record], RequestStatus.Pending)}
                                loading={loading}
                            >
                                Pending
                            </Button>
                        </>
                    );
                }
            }
        },
    ];

    useEffect(() => {
        actionRef.current?.reloadAndRest?.();
    }, [statusFilter]);

    return (
        <>
            <Tabs
                activeKey={statusFilter.toString()}
                onChange={(key) => {
                    setStatusFilter(parseInt(key) as RequestStatus);
                    setSelectedRows([]);
                }}
                style={{ marginBottom: 16 }}
                items={[
                    {
                        key: RequestStatus.Pending.toString(),
                        label: requestStatusLabels[RequestStatus.Pending],
                    },
                    {
                        key: RequestStatus.Approved.toString(),
                        label: requestStatusLabels[RequestStatus.Approved],
                    },
                    {
                        key: RequestStatus.Rejected.toString(),
                        label: requestStatusLabels[RequestStatus.Rejected],
                    },
                ]}
            />

            <ProTable<ChangeRequest>
                rowKey="id"
                headerTitle="Request List"
                actionRef={actionRef}
                loading={loading}
                columns={columns}
                pagination={{
                    current: 1,
                    pageSize: 20
                }}
                request={(params: any, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
                    return fetchData({
                        pageNumber: params.current ?? 1,
                        pageSize: params.pageSize ?? 20,
                        matricNo: params.matricNo,
                        status: statusFilter,
                    });
                }}
                search={{
                    labelWidth: 'auto',
                }}
                rowSelection={
                    statusFilter === RequestStatus.Pending
                        ? {
                            onChange: (_, selectedRows) => setSelectedRows(selectedRows),
                        }
                        : undefined
                }
            />

            {statusFilter === RequestStatus.Pending && selectedRows.length > 0 && (
                <FooterToolbar
                    extra={
                        <div>
                            Chosen <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> item
                        </div>
                    }
                >
                    <Button
                        onClick={async () => handleStatusUpdate(selectedRows, RequestStatus.Approved)}
                    >
                        Batch Approved
                    </Button>
                </FooterToolbar>
            )}

        </>
    );
};

export default RequestManagement;
