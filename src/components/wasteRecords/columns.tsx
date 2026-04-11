import React from 'react';
import { Tooltip } from 'antd';
import { dateTimeFormatter } from '@/lib/utils/formatter';
import { WasteRecord } from '@/lib/types/wasteRecord';
import { Campus, Department, DisposalMethodWithWasteType } from '@/lib/types/typing';
import { wasteRecordStatusLabels, WasteRecordStatus } from '@/lib/enum/status';
import { ActionType, ProColumns } from '@ant-design/pro-components';

type DateRangeFilterValue = [string | Date, string | Date];
const DEFAULT_TEXT_MAX_WIDTH = 220;

const renderEllipsisText = (value: string | undefined, maxWidth = DEFAULT_TEXT_MAX_WIDTH) => {
    const text = value?.trim() || '-';

    if (text === '-') {
        return text;
    }

    return (
        <Tooltip title={text}>
            <span
                style={{
                    display: 'inline-block',
                    maxWidth,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    verticalAlign: 'bottom',
                }}
            >
                {text}
            </span>
        </Tooltip>
    );
};

export const renderAttachments = (_: unknown, record: WasteRecord) => {
    const attachments = Array.isArray(record.attachments) ? record.attachments : [];
    if (attachments.length === 0) return '-';

    if (attachments.length === 1) {
        const file = attachments[0];
        return (
            <Tooltip title={file.fileName}>
                <a
                    href={file.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-block',
                        maxWidth: 180,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {file.fileName}
                </a>
            </Tooltip>
        );
    }

    return (
        <Tooltip
            title={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {attachments.map((file) => (
                        <a
                            key={file.id}
                            href={file.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#fff' }}
                        >
                            {file.fileName}
                        </a>
                    ))}
                </div>
            }
        >
            <span>{`${attachments.length} files`}</span>
        </Tooltip>
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
    showUserColumn?: boolean;
}) => {
    const { campuses, departments, disposalMethods, showUserColumn = false } = params;
    return [
        {
            title: 'No.',
            render: (_: unknown, __: WasteRecord, index: number, action?: ActionType) => {
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
            render: (_: unknown, record: WasteRecord) => new Date(record.date).toLocaleDateString('en-GB'),
            width: 110,
            align: 'center' as const,
            hideInSearch: true,
        },
        {
            title: 'UTM Campus',
            dataIndex: 'campusId',
            valueEnum: listToValueEnum(campuses),
            width: 170,
            ellipsis: true,
            render: (_: unknown, record: WasteRecord) => renderEllipsisText(record.campus, 160),
            align: 'center' as const
        },
        {
            title: 'Faculty / Department / College / PTJ',
            dataIndex: 'departmentId',
            valueEnum: listToValueEnum(departments),
            width: 220,
            ellipsis: true,
            render: (_: unknown, record: WasteRecord) => renderEllipsisText(record.department, 210),
            align: 'center' as const
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            width: 180,
            ellipsis: true,
            render: (_: unknown, record: WasteRecord) => renderEllipsisText(record.unit, 170),
        },
        ...(showUserColumn
            ? [
                {
                    title: 'User',
                    dataIndex: 'userName',
                    width: 230,
                    ellipsis: true,
                    hideInSearch: true,
                    render: (_: unknown, record: WasteRecord) => {
                        const userName = record.userName || '-';
                        const userEmail = record.userEmail;

                        if (!userEmail) {
                            return renderEllipsisText(userName, 210);
                        }

                        return (
                            <div style={{ lineHeight: 1.4, maxWidth: 210 }}>
                                <div>{renderEllipsisText(userName, 210)}</div>
                                <Tooltip title={userEmail}>
                                    <a
                                        href={`mailto:${userEmail}`}
                                        style={{
                                            display: 'inline-block',
                                            maxWidth: 210,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            verticalAlign: 'bottom',
                                        }}
                                    >
                                        {userEmail}
                                    </a>
                                </Tooltip>
                            </div>
                        );
                    },
                },
            ]
            : []),
        {
            title: 'Name of Program / Initiative (if any)',
            dataIndex: 'program',
            width: 240,
            ellipsis: true,
            render: (_: unknown, record: WasteRecord) => renderEllipsisText(record.program, 230),
        },
        {
            title: 'Date of Program/ Initiative',
            dataIndex: 'programDate',
            width: 180,
            render: (programDate: string | Date | null | undefined) => dateTimeFormatter(programDate),
            hideInSearch: true
        },
        {
            title: 'Location',
            dataIndex: 'location',
            width: 180,
            ellipsis: true,
            render: (_: unknown, record: WasteRecord) => renderEllipsisText(record.location, 170),
            align: 'center' as const,
            hideInSearch: true,
        },
        {
            title: 'Disposal Method',
            dataIndex: 'disposalMethodId',
            valueEnum: listToValueEnum(disposalMethods.map(m => ({ id: m.id, name: m.name }))),
            width: 180,
            ellipsis: true,
            render: (_: unknown, record: WasteRecord) => renderEllipsisText(record.disposalMethod, 170),
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
            width: 180,
            ellipsis: true,
            render: (_: unknown, record: WasteRecord) => renderEllipsisText(record.wasteType, 170),
            align: 'center' as const
        },
        {
            title: 'Waste Weight (kg)',
            dataIndex: 'wasteWeight',
            width: 130,
            align: 'center' as const,
            hideInSearch: true,
        },
        {
            title: 'Attachment',
            dataIndex: 'attachments',
            width: 140,
            render: renderAttachments,
            hideInSearch: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            width: 150,
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
                transform: (value: DateRangeFilterValue | undefined) => {
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

