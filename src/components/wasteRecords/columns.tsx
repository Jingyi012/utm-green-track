import React from 'react';
import { Tooltip } from 'antd';
import { dateTimeFormatter } from '@/lib/utils/formatter';
import { WasteRecord } from '@/lib/types/wasteRecord';
import { Campus, Department, DisposalMethodWithWasteType } from '@/lib/types/typing';
import { wasteRecordStatusLabels, WasteRecordStatus } from '@/lib/enum/status';
import { ProColumns } from '@ant-design/pro-components';

export const renderAttachments = (_: any, record: WasteRecord) => {
    const attachments = Array.isArray(record.attachments) ? record.attachments : [];
    if (attachments.length === 0) return '-';

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {attachments.map((file, index) => (
                <Tooltip title="View Attachment" key={index}>
                    <a href={file.filePath} target="_blank" rel="noopener noreferrer">
                        {file.fileName}
                    </a>
                </Tooltip>
            ))}
        </div>
    );
};

const listToValueEnum = (list: { id: string; name: string }[]) =>
    list.reduce((acc, item) => {
        acc[item.id] = { text: item.name };
        return acc;
    }, {} as Record<string, { text: string }>);

/**
 * Returns base columns used by management and approval tables.
 * Each consumer can append its own Action column.
 */
export const getBaseColumns = (params: {
    campuses: Campus[];
    departments: Department[];
    disposalMethods: DisposalMethodWithWasteType[];
}) => {
    const { campuses, departments, disposalMethods } = params;
    return [
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
            render: (_: any, record: WasteRecord) => new Date(record.date).toLocaleDateString('en-GB'),
            align: 'center' as const,
            hideInSearch: true,
        },
        {
            title: 'UTM Campus',
            dataIndex: 'campusId',
            valueEnum: listToValueEnum(campuses),
            render: (_: any, record: WasteRecord) => record.campus,
            align: 'center' as const
        },
        {
            title: 'Faculty / Department / College',
            dataIndex: 'departmentId',
            valueEnum: listToValueEnum(departments),
            render: (_: any, record: WasteRecord) => record.department,
            align: 'center' as const
        },
        {
            title: 'PTJ / Unit',
            dataIndex: 'unit',
        },
        {
            title: 'Name of Program / Initiative (if any)',
            dataIndex: 'program',
        },
        {
            title: 'Date of Program/ Initiative',
            dataIndex: 'programDate',
            render: (programDate: any) => dateTimeFormatter(programDate),
            hideInSearch: true
        },
        {
            title: 'Location',
            dataIndex: 'location',
            align: 'center' as const,
            hideInSearch: true,
        },
        {
            title: 'Disposal Method',
            dataIndex: 'disposalMethodId',
            valueEnum: listToValueEnum(disposalMethods.map(m => ({ id: m.id, name: m.name }))),
            render: (_: any, record: WasteRecord) => record.disposalMethod,
            align: 'center' as const
        },
        {
            title: 'Waste Type',
            dataIndex: 'wasteTypeId',
            valueEnum: disposalMethods
                .flatMap(method => method.wasteTypes)
                .reduce((acc, waste) => {
                    acc[waste.id] = { text: waste.name };
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
            render: renderAttachments,
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
                [WasteRecordStatus.RevisionRequired]: {
                    text: wasteRecordStatusLabels[WasteRecordStatus.RevisionRequired],
                    status: 'Warning',
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
    ] as ProColumns<WasteRecord>[];
};