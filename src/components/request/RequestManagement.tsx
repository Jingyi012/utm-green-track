'use client';

import { RequestStatus, requestStatusLabels } from "@/lib/enum/status";
import { getAllRequest, updateRequestResolveStatus } from "@/lib/services/requestService";
import { ChangeRequest } from "@/lib/types/typing";
import { dateFormatter } from "@/lib/utils/formatter";
import { ActionType, FooterToolbar, ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Button, Popconfirm } from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useState, useRef } from "react";

const RequestManagement: React.FC = () => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<ChangeRequest[]>([]);
    const [selectedRows, setSelectedRows] = useState<ChangeRequest[]>([]);
    const actionRef = useRef<ActionType | undefined>(undefined);

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
            setData(res.data || []);
            return {
                data: res.data,
                success: res.success,
                total: res.totalCount
            }
        } catch (err) {
            message.error("Failed to fetch requests");
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
            dataIndex: 'wasteRecord', align: "center",
            hideInSearch: true,
            render: (_: any, record: ChangeRequest) => {
                if (record.wasteRecord) {
                    let wasteRecord = record.wasteRecord;
                    return (
                        <>
                            <div>Campus: {wasteRecord.campus}</div>
                            <div>Disposal Method: {wasteRecord.disposalMethod}</div>
                            <div>Waste Type: {wasteRecord.wasteType}</div>
                            <div>Waste Weight: {wasteRecord.wasteWeight}</div>
                            <div>Location: {wasteRecord.location}</div>
                            <div>Date: {dateFormatter(wasteRecord.date)}</div>
                        </>
                    );
                }

            }
        },
        {
            title: "Status",
            dataIndex: "status",
            align: "center",
            valueEnum: {
                [RequestStatus.Pending]: {
                    text: requestStatusLabels[RequestStatus.Pending],
                    status: "Default",
                },
                [RequestStatus.Resolved]: {
                    text: requestStatusLabels[RequestStatus.Resolved],
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
                                onClick={() => handleStatusUpdate([record], RequestStatus.Resolved)}
                                loading={loading}
                            >
                                Resolved
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

    return (
        <>
            <ProTable<ChangeRequest>
                rowKey="id"
                headerTitle="Request List"
                actionRef={actionRef}
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={{
                    current: 1,
                    pageSize: 20
                }}
                request={(params: any, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
                    return fetchData({
                        pageNumber: params.current ?? 1,
                        pageSize: params.pageSize ?? 20,
                        matricNo: params.matricNo,
                        status: params?.status,
                    });
                }}
                search={{
                    labelWidth: 'auto',
                }}
                rowSelection={
                    {
                        onChange: (_, selectedRows) => setSelectedRows(selectedRows),
                    }
                }
            />

            {selectedRows.length > 0 && (
                <FooterToolbar
                    extra={
                        <div>
                            Chosen <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> item
                        </div>
                    }
                >
                    <Button
                        onClick={async () => handleStatusUpdate(selectedRows, RequestStatus.Resolved)}
                    >
                        Batch Resolved
                    </Button>
                </FooterToolbar>
            )}

        </>
    );
};

export default RequestManagement;
