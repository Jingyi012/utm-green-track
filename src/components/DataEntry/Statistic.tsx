'use client';

import React, { useEffect, useState } from 'react';
import {
    Table,
    Select,
    Typography,
    Button,
    Space,
    Card,
    Spin,
    message,
} from 'antd';
import {
    FilePdfOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';
import { getWasteSummaryByYear } from '@/lib/api/wasteRecord';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Title } = Typography;
const { Option } = Select;

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];

const WasteManagementTable = () => {
    const [year, setYear] = useState(2025);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async (selectedYear: number) => {
        setLoading(true);
        try {
            const res = await getWasteSummaryByYear(selectedYear);
            setData(res);
        } catch (err: any) {
            message.error(err?.response?.data?.error || 'Failed to fetch waste report');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(year);
    }, [year]);

    // Flatten the data for the table
    const tableData = data
        ? [
            ...months.map((month) => {
                const monthData: any = { key: month, month };
                // Flatten the nested disposalMethod structure
                if (data.monthlyData[month]) {
                    Object.entries(data.monthlyData[month]).forEach(([disposalMethod, wasteTypes]) => {
                        Object.entries(wasteTypes as Record<string, number>).forEach(([wasteType, value]) => {
                            monthData[wasteType] = value;
                        });
                    });
                }
                return monthData;
            }),
            {
                key: 'total',
                month: 'Total',
                // Flatten the totals structure
                ...Object.entries(data.totals || {}).reduce((acc, [disposalMethod, wasteTypes]) => {
                    Object.entries(wasteTypes as Record<string, number>).forEach(([wasteType, value]) => {
                        acc[wasteType] = value;
                    });
                    return acc;
                }, {} as Record<string, number>),
            },
        ]
        : [];

    const renderCell = (text: any, _: any, index: number) =>
        index === months.length ? <strong>{text || 0}</strong> : text || 0;

    const columns = [
        {
            title: 'Month',
            dataIndex: 'month',
            key: 'month',
            fixed: 'left',
            width: 80,
            align: 'center',
            render: renderCell,
        },
        {
            title: 'Landfilling',
            children: [
                { title: 'General Waste', dataIndex: 'generalWaste', key: 'generalWaste', align: 'center', render: renderCell },
                { title: 'Bulk Waste', dataIndex: 'bulkWaste', key: 'bulkWaste', align: 'center', render: renderCell },
                { title: 'Landscape Waste', dataIndex: 'landscapeWaste', key: 'landscapeWaste', align: 'center', render: renderCell },
                { title: 'Recycleble Item', dataIndex: 'recyclebleItem', key: 'recyclebleItem', align: 'center', render: renderCell },
            ]
        },
        {
            title: 'Recycling',
            children: [
                { title: 'Paper', dataIndex: 'paper', key: 'paper', align: 'center', render: renderCell },
                { title: 'Plastic', dataIndex: 'plastic', key: 'plastic', align: 'center', render: renderCell },
                { title: 'Metal', dataIndex: 'metal', key: 'metal', align: 'center', render: renderCell },
                { title: 'Rubber', dataIndex: 'rubber', key: 'rubber', align: 'center', render: renderCell },
                { title: 'E-waste', dataIndex: 'eWaste', key: 'eWaste', align: 'center', render: renderCell },
                { title: 'Textile', dataIndex: 'textile', key: 'textile', align: 'center', render: renderCell },
                { title: 'Used Cooking Oil', dataIndex: 'usedCookingOil', key: 'usedCookingOil', align: 'center', render: renderCell },
            ]
        },
        {
            title: 'Composting',
            children: [
                { title: 'Landscape Waste', dataIndex: 'compostLandscape', key: 'compostLandscape', align: 'center', render: renderCell },
                { title: 'Food/Kitchen Waste', dataIndex: 'foodKitchenWaste', key: 'foodKitchenWaste', align: 'center', render: renderCell },
                { title: 'Animal Manure', dataIndex: 'animalManure', key: 'animalManure', align: 'center', render: renderCell },
            ]
        },
        {
            title: 'Energy Recovery',
            children: [
                { title: 'Wood Waste', dataIndex: 'woodWaste', key: 'woodWaste', align: 'center', render: renderCell },
                { title: 'Food Waste', dataIndex: 'energyFoodWaste', key: 'energyFoodWaste', align: 'center', render: renderCell },
            ]
        }
    ];

    const footerTotals = data?.categoryTotals || {
        landfill: 0,
        recycling: 0,
        composting: 0,
        energyRecovery: 0,
    };

    const handleExportExcel = () => {
        if (!data) return;

        const disposalGroups = columns.slice(1); // Skip "Month"
        const headerRow1: string[] = [''];
        const headerRow2: string[] = ['Month'];

        disposalGroups.forEach(group => {
            const children = group.children ?? [group];
            if (children.length > 1) {
                headerRow1.push(...Array(children.length).fill(group.title));
            } else {
                headerRow1.push(group.title);
            }
            headerRow2.push(...children.map(child => child.title));
        });

        const dataRows = tableData.map(row => {
            const rowData = [row.month];
            disposalGroups.forEach(group => {
                const children = group.children ?? [group];
                children.forEach(child => {
                    rowData.push(row[child.dataIndex] || 0);
                });
            });
            return rowData;
        });

        const sheetData = [headerRow1, headerRow2, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(sheetData);

        // Create merge configuration
        const merges: XLSX.Range[] = [];
        let colIndex = 1;
        disposalGroups.forEach(group => {
            const children = group.children ?? [group];
            if (children.length > 1) {
                merges.push({
                    s: { r: 0, c: colIndex },
                    e: { r: 0, c: colIndex + children.length - 1 },
                });
            } else {
                merges.push({
                    s: { r: 0, c: colIndex },
                    e: { r: 1, c: colIndex },
                });
            }
            colIndex += children.length;
        });

        ws['!merges'] = merges;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `WasteSummary-${year}`);
        XLSX.writeFile(wb, `WasteSummary-${year}.xlsx`);
    };


    const handleExportPDF = () => {
        if (!data) return;

        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(`Waste Management Summary (${year})`, 14, 16);

        const disposalGroups = columns.slice(1); // Skip "Month"

        const headerRow1: any[] = [''];
        const headerRow2: any[] = ['Month'];
        const columnSpans: number[] = [1];

        disposalGroups.forEach(group => {
            const children = group.children ?? [group];
            headerRow1.push({ content: group.title, colSpan: children.length, styles: { halign: 'center' } });
            headerRow2.push(...children.map(child => child.title));
            columnSpans.push(...Array(children.length).fill(1));
        });

        const tableBody = tableData.map(row => {
            const rowData = [row.month];
            disposalGroups.forEach(group => {
                const children = group.children ?? [group];
                children.forEach(child => {
                    rowData.push(row[child.dataIndex] || 0);
                });
            });
            return rowData;
        });

        autoTable(doc, {
            startY: 20,
            head: [headerRow1, headerRow2],
            body: tableBody,
            styles: {
                fontSize: 6.5,
                halign: 'center',
                valign: 'middle',
            },
            headStyles: {
                fillColor: [34, 139, 34], // Forest green
                textColor: [255, 255, 255],
                halign: 'center',
                valign: 'middle',
            },
            bodyStyles: {
                halign: 'center',
                valign: 'middle',
            },
            margin: { top: 20 },
        });

        doc.save(`WasteSummary-${year}.pdf`);
    };

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space align="center">
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Year:</span>
                        <Select value={year} onChange={setYear} style={{ width: 120 }}>
                            <Option value={2023}>2023</Option>
                            <Option value={2024}>2024</Option>
                            <Option value={2025}>2025</Option>
                        </Select>
                    </Space>
                    <Space>
                        <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
                            Excel
                        </Button>
                        <Button icon={<FilePdfOutlined />} danger onClick={handleExportPDF}>
                            PDF
                        </Button>
                    </Space>
                </div>

                {/* Table */}
                {loading ? (
                    <div className='text-center'>
                        <Spin tip="Loading waste report..." />
                    </div>

                ) : (
                    <Table
                        columns={columns}
                        dataSource={tableData}
                        bordered
                        size="middle"
                        scroll={{ x: 'max-content' }}
                        pagination={false}
                        rowKey="key"
                    />
                )}

                {/* Footer Totals */}
                {!loading && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            backgroundColor: 'white',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <strong>Total Landfilling:</strong> {footerTotals.landfill} KG
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <strong>Total Recycling:</strong> {footerTotals.recycling} KG
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <strong>Total Composting:</strong> {footerTotals.composting} KG
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <strong>Total ER:</strong> {footerTotals.energyRecovery} KG
                        </div>
                    </div>
                )}
            </Space>
        </Card>
    );
};

export default WasteManagementTable;