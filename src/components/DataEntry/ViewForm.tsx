'use client';

import {
    Table,
    Input,
    Button,
    Space,
    Tooltip,
    Badge,
    message,
} from 'antd';
import {
    SearchOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    PaperClipOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getWasteRecordsPaginated } from '@/lib/api/wasteRecord';
import { fetchWithAuth } from '@/lib/api/common';

const pageSize = 20;

const WasteTable = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getWasteRecordsPaginated(page, pageSize, search);
            setData(res.data);
            setTotal(res.pagination.total);
        } catch (err: any) {
            message.error(err.message || 'Failed to fetch records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, search]);

    const columns = [
        {
            title: 'No.',
            render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
            width: 60,
            align: 'center' as const,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            render: (date: string) => new Date(date).toLocaleDateString('en-GB'),
            align: 'center' as const,
        },
        {
            title: 'UTM Campus', dataIndex: 'campusName',
            align: 'center' as const
        },
        {
            title: 'Location', dataIndex: 'location',
            align: 'center' as const
        },
        {
            title: 'Disposal Method', dataIndex: 'disposalMethod',
            align: 'center' as const
        },
        {
            title: 'Waste Type', dataIndex: 'wasteType',
            align: 'center' as const
        },
        {
            title: 'Waste Weight (kg)',
            dataIndex: 'wasteWeight',
            align: 'center' as const,
        },
        {
            title: 'Attachment',
            render: () => (
                <Tooltip title="View Attachment">
                    <PaperClipOutlined />
                </Tooltip>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: string) => {
                const color = status === 'New' ? 'blue' : 'green';
                return <Badge color={color} text={status} />;
            },
            align: 'center' as const,
        },
    ];

    const downloadFile = async (type: 'excel' | 'pdf') => {
        const res = await fetchWithAuth(`/api/waste-record/export/${type}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = type === 'excel' ? 'WasteRecords.xlsx' : 'WasteRecords.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <Space
                style={{ marginBottom: 16, justifyContent: 'flex-end', width: '100%' }}
                wrap
            >
                <Input
                    placeholder="Search"
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1); // Reset to page 1 when searching
                    }}
                    style={{ width: 200 }}
                />
                <Button icon={<FileExcelOutlined />} onClick={() => downloadFile('excel')}>Excel</Button>
                <Button icon={<FilePdfOutlined />} danger onClick={() => downloadFile('pdf')}>PDF</Button>

            </Space>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    onChange: (newPage) => setPage(newPage),
                    showSizeChanger: false,
                }}
                bordered
                size="middle"
                scroll={{ x: 'max-content' }}
                rowKey="id"
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
        </div>
    );
};

export default WasteTable;
