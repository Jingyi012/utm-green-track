'use client';

import {
    Button,
    Tooltip,
    Card,
    App,
} from 'antd';
import {
    FilePdfOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';
import { useRef, useState } from 'react';
import { exportExcelWasteRecords, exportPdfWasteRecords, getWasteRecordsPaginated } from '@/lib/services/wasteRecord';
import { ActionType, ModalForm, ProColumns, ProFormText, ProTable } from '@ant-design/pro-components';
import { WasteRecord, WasteRecordFilter } from '@/lib/types/wasteRecord';
import { WasteRecordStatus, wasteRecordStatusLabels } from '@/lib/enum/status';
import { SortOrder } from 'antd/lib/table/interface';
import { useWasteRecordDropdownOptions } from '@/hook/options';
import { downloadFile } from '@/lib/utils/downloadFile';
import { ExportModal } from './ExportModal';
import { createRequest } from '@/lib/services/requestService';
import { dateFormatter } from '@/lib/utils/formatter';

const ViewForm = () => {
    const { message } = App.useApp();
    const { campuses, disposalMethods } = useWasteRecordDropdownOptions();
    const [data, setData] = useState<WasteRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<WasteRecord | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [excelLoading, setExcelLoading] = useState<boolean>(false);
    const [pdfLoading, setPdfLoading] = useState<boolean>(false);
    const actionRef = useRef<ActionType | undefined>(undefined);

    const [modalOpen, setModalOpen] = useState<false | "excel" | "pdf">(false);

    const [changeRequestModalOpen, setChangeRequestModalOpen] = useState<boolean>(false);

    const fetchData = async (filters: WasteRecordFilter) => {
        setLoading(true);
        try {
            const res = await getWasteRecordsPaginated(filters);
            setData(res.data);
            return {
                data: res.data,
                success: res.success,
                total: res.totalCount
            }
        } catch (err: any) {
            message.error(err.message || 'Failed to fetch records');
            return {
                data: [],
                success: false,
                total: 0
            }
        } finally {
            setLoading(false);
        }
    };

    const columns: ProColumns[] = [
        {
            title: 'No.',
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
            title: 'Date',
            dataIndex: 'date',
            render: (_: any, record: WasteRecord) => dateFormatter(record.date),
            align: 'center' as const,
            hideInSearch: true,
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
            align: 'center' as const,
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
            title: 'Action',
            valueType: 'option',
            align: 'center' as const,
            render: (_: any, record: WasteRecord) => {
                return (
                    <>
                        {record.status != WasteRecordStatus.Verified &&
                            (<Button onClick={() => {
                                setSelectedRecord(record);
                                setChangeRequestModalOpen(true);
                            }}>
                                Request Changes
                            </Button>
                            )
                        }
                    </>
                )
            }
        }
    ];

    const handleExportExcel = async (year: number, month: number) => {

        const hide = message.loading("Generating Excel...");
        try {
            setExcelLoading(true);
            const response = await exportExcelWasteRecords({ year, month });
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, "Waste_Records.xlsx");
        } catch (err: any) {
            message.error('Failed to generate Excel');
        } finally {
            setExcelLoading(false);
            hide();
        }
    };

    const handleExportPDF = async (year: number, month: number) => {
        const hide = message.loading("Generating Pdf...");
        try {
            setPdfLoading(true);
            const response = await exportPdfWasteRecords({ year, month });
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, "Waste_Records.pdf");
        } catch (err: any) {
            message.error('Failed to generate PDF');
        } finally {
            setPdfLoading(false);
            hide();
        }
    };

    const handleChangeRequest = async (wasteRecordId: string | undefined, reqMessage: string) => {
        const hide = message.loading("Sending request...", 0);
        try {
            const res = await createRequest({
                wasteRecordId: wasteRecordId,
                message: reqMessage,
            });
            if (res.success) {
                if (actionRef.current) {
                    actionRef.current.reload();
                }
                message.success("Request created successfully");
                return true;
            } else {
                message.error("Failed to send request");
                return false;
            }
        } catch (err) {
            message.error("Failed to send request")
        } finally {
            hide();
        }
    };

    return (
        <>
            <Card title={'View Form'}>
                <ProTable
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    request={(params: any, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
                        return fetchData({
                            pageNumber: params.current ?? 1,
                            pageSize: params.pageSize ?? 20,
                            campus: params?.campus,
                            disposalMethod: params?.disposalMethod,
                            wasteType: params?.wasteType,
                            status: params?.status,
                            fromDate: params?.fromDate,
                            toDate: params?.toDate,
                        });
                    }}
                    pagination={{
                        showSizeChanger: true
                    }}
                    bordered
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    rowKey="id"
                    options={false}
                    toolbar={{
                        // search: (
                        //     <Input
                        //         placeholder="Search"
                        //         prefix={<SearchOutlined />}
                        //         value={search}
                        //         onChange={(e) => {
                        //             setSearch(e.target.value);
                        //             setPage(1);
                        //         }}
                        //         style={{ width: 200 }}
                        //     />
                        // ),
                        actions: [
                            <Button
                                key="excel"
                                loading={excelLoading}
                                icon={<FileExcelOutlined />}
                                onClick={() => setModalOpen("excel")}
                            >
                                Excel
                            </Button>,
                            <Button
                                key="pdf"
                                loading={pdfLoading}
                                icon={<FilePdfOutlined />}
                                danger
                                onClick={() => setModalOpen("pdf")}
                            >
                                PDF
                            </Button>,
                        ],
                    }}
                    search={{
                        labelWidth: 'auto',
                    }}
                />

                <style jsx global>{`
                .ant-table-thead > tr > th {
                    background-color: #d9ead3 !important;
                    text-align: center;
                }
                .ant-table-cell {
                    text-align: center;
                }
                .ant-pagination-total-text {
                    float: right;
                    margin-top: 8px;
                    font-weight: 500;
                    font-family: monospace;
                }
            `}</style>
            </Card>
            <ExportModal
                open={!!modalOpen}
                type={modalOpen || "excel"}
                onCancel={() => setModalOpen(false)}
                onConfirm={(year: number, month: number) => {
                    if (modalOpen === "excel") handleExportExcel(year, month);
                    if (modalOpen === "pdf") handleExportPDF(year, month);
                }}
            />
            <ModalForm
                title="Request Changes"
                open={changeRequestModalOpen}
                modalProps={{
                    destroyOnClose: true,
                    onCancel: () => {
                        setSelectedRecord(undefined);
                        setChangeRequestModalOpen(false);
                    },
                }}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedRecord(undefined);
                        setChangeRequestModalOpen(false);
                    }
                }}
                onFinish={async (values) => {
                    const success = await handleChangeRequest(selectedRecord?.id, values.message);
                    if (success) {
                        if (actionRef.current) {
                            actionRef.current.reload();
                        }
                        return true;
                    } else {
                        return false;
                    }
                }}
            >
                <ProFormText
                    label="Message"
                    name="message"
                    placeholder="Please enter message"
                    rules={[{ required: true }]}
                />
            </ModalForm>
        </>
    );
};

export default ViewForm;