'use client';

import React, { useEffect, useState } from 'react';
import {
    Table,
    Select,
    Button,
    Space,
    Card,
    message,
} from 'antd';
import {
    FilePdfOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';
import { getWasteStatisticByYear } from '@/lib/services/wasteRecord';
import { formatNumber } from '@/lib/utils/formatter';
import { confirmAction } from '@/lib/utils/confirmAction';
import { exportExcelWasteStatistic, exportPDFWasteStatistic } from '@/lib/reportExports/wasteStatistics';
import { WasteType, WasteTypeLabels } from '@/lib/enum/wasteType';
import { DisposalMethod } from '@/lib/enum/disposalMethod';
import { MonthlyStatisticByYearResponse } from '@/lib/types/wasteSummary';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => ({
    label: (2023 + i).toString(),
    value: 2023 + i,
})).reverse();

const transformWasteData = (raw: MonthlyStatisticByYearResponse) => {
    const monthMap: Record<string, any> = {};

    const getMonthLabel = (month: number) =>
        new Date(2025, month - 1).toLocaleString("default", { month: "short" });

    for (const { month, disposalMethod, wasteType, totalWeight } of raw.monthlyData) {
        const key = getMonthLabel(Number(month));
        if (!monthMap[key]) monthMap[key] = { month: key };

        if (!monthMap[key][disposalMethod]) monthMap[key][disposalMethod] = {};
        monthMap[key][disposalMethod][wasteType] = totalWeight;
    }

    // Convert to array & fill missing months
    const monthlyRows = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const key = getMonthLabel(m);
        return {
            key: m,
            month: key,
            ...monthMap[key]
        };
    });

    // Build totals row (same structure as monthly rows)
    const totalsRow: any = {
        key: 'total',
        month: 'Total',
    };
    for (const { disposalMethod, wasteType, totalWeight } of raw.totals) {
        if (!totalsRow[disposalMethod]) totalsRow[disposalMethod] = {};
        totalsRow[disposalMethod][wasteType] = totalWeight;
    }

    // Rebuild category total (for summary display)
    const categoryTotals: Record<string, number> = {};
    for (const { disposalMethod, totalWeight } of raw.categoryTotals) {
        categoryTotals[disposalMethod] = totalWeight;
    }

    return {
        tableData: [...monthlyRows, totalsRow],
        categoryTotals,
    };
}

const WasteManagementTable = () => {
    const [year, setYear] = useState<number>(currentYear);
    const [data, setData] = useState<{ raw: MonthlyStatisticByYearResponse; tableData: any, categoryTotals: any } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [excelLoading, setExcelLoading] = useState<boolean>(false);
    const [pdfLoading, setPdfLoading] = useState<boolean>(false);

    const fetchData = async (selectedYear: number) => {
        setLoading(true);
        try {
            const res = await getWasteStatisticByYear(selectedYear);
            const transformed = transformWasteData(res.data);
            setData({
                raw: res.data,
                ...transformed
            });
        } catch (err: any) {
            message.error(err?.response?.data?.error || 'Failed to fetch waste report');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(year);
    }, [year]);

    const categoryTotals = data?.categoryTotals || {
        landfilling: 0,
        recycling: 0,
        composting: 0,
        energyRecovery: 0,
    };

    const renderCell = (value: any, _: any, index: number) => index === 12 ? <strong>{value || 0}</strong> : value || 0;
    const renderMonth = (value: any, _: any, index: number) => index === 12 ? <strong>{value}</strong> : value;

    const columns = [
        { title: 'Month', dataIndex: 'month', key: 'month', fixed: 'left' as const, width: 80, align: 'center' as const, render: renderMonth },
        {
            title: 'Landfilling', dataIndex: DisposalMethod.Landfilling, children: [
                { title: WasteTypeLabels[WasteType.GeneralWaste], dataIndex: [DisposalMethod.Landfilling, WasteType.GeneralWaste], key: 'landfilling_GeneralWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.BulkWaste], dataIndex: [DisposalMethod.Landfilling, WasteType.BulkWaste], key: 'landfilling_BulkWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.LandscapeWaste], dataIndex: [DisposalMethod.Landfilling, WasteType.LandscapeWaste], key: 'landfilling_LandscapeWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.RecyclableItem], dataIndex: [DisposalMethod.Landfilling, WasteType.RecyclableItem], key: 'landfilling_RecyclableItem', align: 'center', render: renderCell }
            ]
        },
        {
            title: 'Recycling', dataIndex: DisposalMethod.Recycling, children: [
                { title: WasteTypeLabels[WasteType.Paper], dataIndex: [DisposalMethod.Recycling, WasteType.Paper], key: 'recycling_Paper', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.Plastic], dataIndex: [DisposalMethod.Recycling, WasteType.Plastic], key: 'recycling_Plastic', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.Metal], dataIndex: [DisposalMethod.Recycling, WasteType.Metal], key: 'recycling_Metal', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.Rubber], dataIndex: [DisposalMethod.Recycling, WasteType.Rubber], key: 'recycling_Rubber', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.Ewaste], dataIndex: [DisposalMethod.Recycling, WasteType.Ewaste], key: 'recycling_Ewaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.Textile], dataIndex: [DisposalMethod.Recycling, WasteType.Textile], key: 'recycling_Textile', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.UsedCookingOil], dataIndex: [DisposalMethod.Recycling, WasteType.UsedCookingOil], key: 'recycling_UsedCookingOil', align: 'center', render: renderCell }
            ]
        },
        {
            title: 'Composting', dataIndex: DisposalMethod.Composting, children: [
                { title: WasteTypeLabels[WasteType.LandscapeWaste], dataIndex: [DisposalMethod.Composting, WasteType.LandscapeWaste], key: 'composting_LandscapeWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.FoodKitchenWaste], dataIndex: [DisposalMethod.Composting, WasteType.FoodKitchenWaste], key: 'composting_FoodKitchenWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.AnimalManure], dataIndex: [DisposalMethod.Composting, WasteType.AnimalManure], key: 'composting_AnimalManure', align: 'center', render: renderCell }
            ]
        },
        {
            title: 'Energy Recovery', dataIndex: DisposalMethod.EnergyRecovery, children: [
                { title: WasteTypeLabels[WasteType.WoodWaste], dataIndex: [DisposalMethod.EnergyRecovery, WasteType.WoodWaste], key: 'energyRecovery_WoodWaste', align: 'center', render: renderCell },
                { title: WasteTypeLabels[WasteType.FoodWaste], dataIndex: [DisposalMethod.EnergyRecovery, WasteType.FoodWaste], key: 'energyRecovery_FoodWaste', align: 'center', render: renderCell }
            ]
        }
    ];

    const handleExportExcel = async () => {
        const confirmed = await confirmAction({
            title: 'Confirm Excel Export',
            content: `Are you sure you want to download the Excel file for ${year} waste statistic?`,
        });
        if (!confirmed) return;
        const hide = message.loading("Generating Excel...");
        try {
            setExcelLoading(true);
            await exportExcelWasteStatistic(data?.tableData || [], columns, year);
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
            await exportPDFWasteStatistic(data?.tableData || [], columns, year);
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
                    dataSource={data?.tableData || []}
                    bordered
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    pagination={false}
                    rowKey="key"
                />

                {/* Category Totals */}

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
                        <strong>Total Landfilling:</strong> {formatNumber(categoryTotals.landfilling)} KG
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <strong>Total Recycling:</strong> {formatNumber(categoryTotals.recycling)} KG
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <strong>Total Composting:</strong> {formatNumber(categoryTotals.composting)} KG
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <strong>Total ER:</strong> {formatNumber(categoryTotals.energyRecovery)} KG
                    </div>
                </div>

            </Space>
        </Card>
    );
};

export default WasteManagementTable;