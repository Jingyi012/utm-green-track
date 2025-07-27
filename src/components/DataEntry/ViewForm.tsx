'use client';

import {
    Input,
    Button,
    Tooltip,
    Badge,
    message,
    Card,
} from 'antd';
import {
    SearchOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    PaperClipOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getWasteRecords, getWasteRecordsPaginated } from '@/lib/services/wasteRecord';
import { exportExcelWasteRecord, exportPdfWasteRecord } from '@/lib/reportExports/wasteRecords';
import { confirmAction } from '@/lib/utils/confirmAction';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Campus, CampusLabels } from '@/lib/enum/campus';
import { DisposalMethod, DisposalMethodLabels } from '@/lib/enum/disposalMethod';
import { WasteType, WasteTypeLabels } from '@/lib/enum/wasteType';
import { WasteRecord } from '@/lib/types/wasteRecord';
import { WasteRecordStatus, wasteRecordStatusLabels } from '@/lib/enum/wasteRecordStatus';
import { SortOrder } from 'antd/lib/table/interface';

const pageSize = 20;

const WasteTable = () => {
    const [page, setPage] = useState<number>(1);
    const [data, setData] = useState<WasteRecord[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [excelLoading, setExcelLoading] = useState<boolean>(false);
    const [pdfLoading, setPdfLoading] = useState<boolean>(false);

    const fetchData = async (filters: {
        pageNumber?: number,
        pageSize?: number,
        campus?: string,
        disposalMethod?: string,
        wasteType?: string,
        status?: string,
        fromDate?: string,
        toDate?: string
    }) => {
        setLoading(true);
        try {
            const res = await getWasteRecordsPaginated({
                pageNumber: filters.pageNumber ?? 1,
                pageSize: filters.pageSize ?? 20,
                ...filters,
            });
            setData(res.data);
            setTotal(res.pagination.totalCount);
            setPage(res.pagination.pageNumber);
            return {
                data: res.data,
                success: res.success,
                total: res.pagination.totalCount
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
            title: 'Date Range',
            dataIndex: 'date',
            valueType: 'dateRange',
            hideInTable: true,
            fieldProps: {
                format: 'YYYY-MM-DD',
            },
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
        },
        {
            title: 'UTM Campus',
            dataIndex: 'campus',
            valueEnum: Object.fromEntries(
                Object.entries(CampusLabels).map(([value, label]) => [
                    value,
                    { text: label },
                ])
            ),
            render: (_: any, record: WasteRecord) => CampusLabels[record.campus as Campus] || record.campus,
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
            valueEnum: Object.fromEntries(
                Object.entries(DisposalMethodLabels).map(([value, label]) => [
                    value,
                    { text: label },
                ])
            ),
            render: (_: any, record: WasteRecord) => DisposalMethodLabels[record.disposalMethod as DisposalMethod] || record.disposalMethod,
            align: 'center' as const
        },
        {
            title: 'Waste Type',
            dataIndex: 'wasteType',
            valueEnum: Object.fromEntries(
                Object.entries(WasteTypeLabels).map(([value, label]) => [
                    value,
                    { text: label },
                ])
            ),
            render: (_: any, record: WasteRecord) => WasteTypeLabels[record.wasteType as WasteType] || record.wasteType,
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
            render: (attachments: { filePath: string }[]) => {
                if (!attachments || attachments.length === 0) return '-';

                return attachments.map((file, index) => (
                    <Tooltip title="View Attachment" key={index}>
                        <a href={file.filePath} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}>
                            <PaperClipOutlined />
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
        }
    ];

    const handleExportExcel = async () => {
        const confirmed = await confirmAction({
            title: 'Confirm Excel Export',
            content: 'Are you sure you want to download the Excel file for these waste records?',
        });
        if (!confirmed) return;

        const hide = message.loading("Generating Excel...");
        try {
            setExcelLoading(true);
            const response = await getWasteRecords({});
            exportExcelWasteRecord(response.data);
        } catch (err: any) {
            message.error(err.message || 'Failed to generate excel');
        } finally {
            setExcelLoading(false);
            hide();
        }
    };

    const handleExportPDF = async () => {
        const confirmed = await confirmAction({
            title: 'Confirm PDF Export',
            content: 'Are you sure you want to download the PDF file for these waste records?',
        });
        if (!confirmed) return;

        const hide = message.loading("Generating Pdf...");
        try {
            setPdfLoading(true);
            const response = await getWasteRecords({});
            exportPdfWasteRecord(response.data);
        } catch (err: any) {
            message.error(err.message || 'Failed to generate pdf');
        } finally {
            setPdfLoading(false);
            hide();
        }
    };

    return (
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
                            onClick={handleExportExcel}
                        >
                            Excel
                        </Button>,
                        <Button
                            key="pdf"
                            loading={pdfLoading}
                            icon={<FilePdfOutlined />}
                            danger
                            onClick={handleExportPDF}
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
    );
};

export default WasteTable;