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
import { getWasteStatisticByYear } from '@/lib/services/wasteRecord';
import { formatNumber, toPascalCase } from '@/lib/utils/formatter';
import { confirmAction } from '@/lib/utils/confirmAction';
import { exportExcelWasteStatistic, exportPDFWasteStatistic } from '@/lib/reportExports/wasteStatistics';
import { MONTH_NAMES } from '@/lib/enum/monthName';
import { WasteType, WasteTypeLabels } from '@/lib/enum/wasteType';

const months = MONTH_NAMES;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => ({
    label: (2023 + i).toString(),
    value: 2023 + i,
})).reverse();

const WasteManagementTable = () => {
    const [year, setYear] = useState<number>(currentYear);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [excelLoading, setExcelLoading] = useState<boolean>(false);
    const [pdfLoading, setPdfLoading] = useState<boolean>(false);

    const fetchData = async (selectedYear: number) => {
        setLoading(true);
        try {
            const res = await getWasteStatisticByYear(selectedYear);
            setData(res.data);
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
            ...data.monthlyData,
            {
                month: 'Total',
                ...data.totals
            },
        ]
        : [];

    const renderCell = (text: any, _: any, index: number) =>
        index === months.length ? <strong>{text || 0}</strong> : text || 0;

    const renderMonthCell = (text: any, _: any, index: number) => {
        const displayText = toPascalCase(text);
        return index === months.length ? <strong>{displayText}</strong> : displayText;
    };

    const columns = [
        { title: 'Month', dataIndex: 'month', key: 'month', fixed: 'left' as const, width: 80, align: 'center' as const, render: renderMonthCell },
        {
            title: 'Landfilling', dataIndex: 'landfilling', children: [
                { title: WasteTypeLabels[WasteType.GeneralWaste], dataIndex: ['landfilling', WasteType.GeneralWaste], key: 'landfilling_GeneralWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.BulkWaste], dataIndex: ['landfilling', WasteType.BulkWaste], key: 'landfilling_BulkWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.LandscapeWaste], dataIndex: ['landfilling', WasteType.LandscapeWaste], key: 'landfilling_LandscapeWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.RecyclableItem], dataIndex: ['landfilling', WasteType.RecyclableItem], key: 'landfilling_RecyclableItem', align: 'center', render: renderCell }
            ]
        },
        {
            title: 'Recycling', dataIndex: 'recycling', children: [
                { title: WasteTypeLabels[WasteType.Paper], dataIndex: ['recycling', WasteType.Paper], key: 'recycling_Paper', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.Plastic], dataIndex: ['recycling', WasteType.Plastic], key: 'recycling_Plastic', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.Metal], dataIndex: ['recycling', WasteType.Metal], key: 'recycling_Metal', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.Rubber], dataIndex: ['recycling', WasteType.Rubber], key: 'recycling_Rubber', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.Ewaste], dataIndex: ['recycling', WasteType.Ewaste], key: 'recycling_Ewaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.Textile], dataIndex: ['recycling', WasteType.Textile], key: 'recycling_Textile', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.UsedCookingOil], dataIndex: ['recycling', WasteType.UsedCookingOil], key: 'recycling_UsedCookingOil', align: 'center', render: renderCell }
            ]
        },
        {
            title: 'Composting', dataIndex: 'composting', children: [
                { title: WasteTypeLabels[WasteType.LandscapeWaste], dataIndex: ['composting', WasteType.LandscapeWaste], key: 'composting_LandscapeWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.FoodKitchenWaste], dataIndex: ['composting', WasteType.FoodKitchenWaste], key: 'composting_FoodKitchenWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.AnimalManure], dataIndex: ['composting', WasteType.AnimalManure], key: 'composting_AnimalManure', align: 'center', render: renderCell }
            ]
        },
        {
            title: 'Energy Recovery', dataIndex: 'energyRecovery', children: [
                { title: WasteTypeLabels[WasteType.WoodWaste], dataIndex: ['energyRecovery', WasteType.WoodWaste], key: 'energyRecovery_WoodWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.FoodWaste], dataIndex: ['energyRecovery', WasteType.FoodWaste], key: 'energyRecovery_FoodWaste', align: 'center', render: renderCell }
            ]
        }
    ];

    const footerTotals = data?.categoryTotals || {
        landfilling: 0,
        recycling: 0,
        composting: 0,
        energyRecovery: 0,
    };

    const handleExportExcel = async () => {
        const confirmed = await confirmAction({
            title: 'Confirm Excel Export',
            content: `Are you sure you want to download the Excel file for ${year} waste statistic?`,
        });
        if (!confirmed) return;
        const hide = message.loading("Generating Excel...");
        try {
            setExcelLoading(true);
            await exportExcelWasteStatistic(tableData, columns, year);
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
            content: `Are you sure you want to download the PDF file for ${year} waste statistic?`,
        });
        if (!confirmed) return;
        const hide = message.loading("Generating PDF...");
        try {
            setPdfLoading(true);
            await exportPDFWasteStatistic(tableData, columns, year);
        } catch (err: any) {
            message.error(err.message || 'Failed to generate pdf');
        } finally {
            setPdfLoading(false);
            hide();
        }
    };

    return (
        <Card title={'Statistic'} loading={loading}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space align="center">
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Year:</span>
                        <Select
                            value={year}
                            onChange={setYear}
                            style={{ width: 120 }}
                            options={yearOptions}
                        />
                    </Space>
                    <Space>
                        <Button loading={excelLoading} icon={<FileExcelOutlined />} onClick={handleExportExcel}>
                            Excel
                        </Button>
                        <Button loading={pdfLoading} icon={<FilePdfOutlined />} danger onClick={handleExportPDF}>
                            PDF
                        </Button>
                    </Space>
                </div>

                {/* Table */}

                <Table
                    columns={columns}
                    dataSource={tableData}
                    bordered
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    pagination={false}
                    rowKey="key"
                />


                {/* Footer Totals */}

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
                        <strong>Total Landfilling:</strong> {formatNumber(footerTotals.landfilling)} KG
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <strong>Total Recycling:</strong> {formatNumber(footerTotals.recycling)} KG
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <strong>Total Composting:</strong> {formatNumber(footerTotals.composting)} KG
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <strong>Total ER:</strong> {formatNumber(footerTotals.energyRecovery)} KG
                    </div>
                </div>

            </Space>
        </Card>
    );
};

export default WasteManagementTable;