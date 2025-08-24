'use client';

import { useWasteRecordDropdownOptions } from "@/hook/options";
import { WasteRecordStatus, wasteRecordStatusLabels } from "@/lib/enum/status";
import { UserDetails } from "@/lib/types/typing";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, Modal, Tooltip, message } from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useState, useRef } from "react";
import WasteRecordDrawerForm from "./WasteRecordDrawerForm";
import { WasteRecord, WasteRecordFilter } from "@/lib/types/wasteRecord";
import { deleteAttachment, deleteWasteRecord, getWasteRecordsPaginated, updateWasteRecord, uploadAttachments } from "@/lib/services/wasteRecord";

const WasteRecordManagement: React.FC = () => {
    const { campuses, disposalMethods, isLoading } = useWasteRecordDropdownOptions();
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPagesize] = useState<number>(20);
    const [data, setData] = useState<WasteRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<WasteRecord>();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);

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

    const handleWasteRecordUpdate = async (wasteRecord: WasteRecord) => {
        try {
            setLoading(true);
            const fileList = wasteRecord.uploadedAttachments?.fileList ?? [];

            const newAttachments = fileList.filter(f => f.originFileObj);

            const initialAttachmentIds = selectedRecord?.attachments?.map(f => f.id) ?? [];

            const currentIds = fileList.filter(f => !f.originFileObj).map(f => f.uid);

            const fileToRemove = initialAttachmentIds.filter(id => !currentIds.includes(id));

            const res = await updateWasteRecord(wasteRecord.id, {
                id: wasteRecord.id,
                campus: wasteRecord.campus,
                disposalMethodId: wasteRecord.disposalMethodId,
                wasteTypeId: wasteRecord.wasteTypeId,
                wasteWeight: wasteRecord.wasteWeight,
                location: wasteRecord.location,
                status: wasteRecord.status,
            });

            if (!res.success) {
                message.error(res.message || "Failed to update wasteRecord");
                return false;
            }

            if (newAttachments.length > 0) {
                await uploadAttachments(newAttachments, wasteRecord.id);
            }

            if (fileToRemove.length > 0) {
                await Promise.all(fileToRemove.map(id => deleteAttachment(id)));
            }

            message.success("Waste record updated successfully");
            return true;
        } catch (err) {
            message.error("Failed to update wasteRecord");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const confirmDeletion = async (wasteRecord: WasteRecord) => {
        Modal.confirm({
            title: 'Confirm Deletion',
            content: 'Are you sure you want to delete this waste record?',
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => handleWasteRecordDelete(wasteRecord),
        });
    }

    const handleWasteRecordDelete = async (wasteRecord: WasteRecord) => {
        try {
            setLoading(true);

            const res = await deleteWasteRecord(wasteRecord.id);

            if (res.success) {
                message.success("Waste record deleted successfully");
                actionRef.current?.reload();
            }
            else {
                message.error("Failed to delete waste record, please try again");
            }
        } catch (err) {
            message.error("Failed to delete waste record, please try again");
        } finally {
            setLoading(false);
        }
    }

    const columns: ProColumns<WasteRecord>[] = [
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

                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {attachments.map((file, index) => (
                            <Tooltip title="View Attachment" key={index}>
                                <a
                                    href={file.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {file.fileName}
                                </a>
                            </Tooltip>
                        ))}
                    </div>
                );
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
                return <>
                    <Button
                        type="link"
                        onClick={() => {
                            setSelectedRecord(record);
                            setModalOpen(true);
                            setEditMode(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => {
                            confirmDeletion(record);
                        }}
                    >
                        Delete
                    </Button>
                </>
            }
        },
    ];

    return (
        <>
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
                        status: params.status,
                        fromDate: params.fromDate,
                        toDate: params.toDate
                    });
                }}
                search={{
                    labelWidth: 'auto',
                }}
            />

            <WasteRecordDrawerForm
                campuses={campuses}
                disposalMethods={disposalMethods}
                onCancel={() => {
                    setModalOpen(false);
                    setEditMode(false);
                    setTimeout(() => setSelectedRecord(undefined), 300);
                }
                }
                onSubmit={async (value) => {
                    const success = await handleWasteRecordUpdate(value as WasteRecord);
                    if (success) {
                        if (actionRef.current) {
                            actionRef.current.reload();
                        }
                        return true;
                    }
                    return false;
                }}
                visible={modalOpen}
                initialValues={selectedRecord || {}}
                isEditMode={editMode}
                handleDelete={async () => confirmDeletion(selectedRecord!)}
            />
        </>
    );
};

export default WasteRecordManagement;
