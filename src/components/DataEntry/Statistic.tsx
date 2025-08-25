'use client';

import React, { useEffect, useState } from 'react';
import {
    Table,
    Select,
    Button,
    Space,
    Card,
    App,
} from 'antd';
import {
    FilePdfOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';
import { exportExcelWasteStatistics, exportPdfWasteStatistics, getWasteStatisticByYear } from '@/lib/services/wasteRecord';
import { formatNumber } from '@/lib/utils/formatter';
import { confirmAction } from '@/lib/utils/confirmAction';
import { MonthlyStatisticByYearResponse } from '@/lib/types/wasteSummary';
import { useWasteRecordDropdownOptions } from '@/hook/options';
import { MONTH_LABELS_SHORT } from '@/lib/enum/monthName';
import { DisposalMethodWithWasteType } from '@/lib/types/typing';
import { ColumnsType } from 'antd/es/table';
import { downloadFile } from '@/lib/utils/downloadFile';

export interface StatisticRow {
    month: string;
    data: {
        [disposalMethod: string]: {
            [wasteType: string]: number;
        };
    };
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => ({
    label: (2023 + i).toString(),
    value: 2023 + i,
})).reverse();

const transformWasteData = (rawData: MonthlyStatisticByYearResponse, disposalMethods: DisposalMethodWithWasteType[]) => {
    const monthLabels = MONTH_LABELS_SHORT;
    const allWasteMap: Record<string, string[]> = {};

    disposalMethods.forEach(({ name: disposalMethod, wasteTypes }) => {
        allWasteMap[disposalMethod] = wasteTypes.map(wt => wt.name);
    });

    const tableData: StatisticRow[] = [];

    for (let i = 0; i < 12; i++) {
        const monthName = monthLabels[i];
        const row: StatisticRow = {
            month: monthName,
            data: {},
        };

        // Initialize all disposal methods and waste types with 0
        for (const [method, types] of Object.entries(allWasteMap)) {
            row.data[method] = {};
            types.forEach(type => {
                row.data[method][type] = 0;
            });
        }

        // Fill actual values if available
        const summary = rawData.monthlyWasteSummary.find(m => m.month === i + 1);
        if (summary) {
            summary.wasteTypeTotals.forEach(({ disposalMethod, wasteType, totalWeight }) => {
                row.data[disposalMethod][wasteType] = totalWeight;
            });
        }

        tableData.push(row);
    }

    // Build totals row (same structure as monthly rows)
    const totalsRow: StatisticRow = {
        month: "Total",
        data: {},
    };

    // Initialize with 0
    for (const [method, types] of Object.entries(allWasteMap)) {
        totalsRow.data[method] = {};
        types.forEach(type => {
            totalsRow.data[method][type] = 0;
        });
    }

    // Fill actual totals
    rawData.wasteTypeTotals.forEach(({ disposalMethod, wasteType, totalWeight }) => {
        totalsRow.data[disposalMethod][wasteType] = totalWeight;
    });

    // Rebuild category total (for summary display)
    const categoryTotals: Record<string, number> = {};
    Object.keys(allWasteMap).forEach(method => {
        categoryTotals[method] = 0;
    });

    // Step 2: Fill actual totals from raw data
    rawData.disposalMethodTotals.forEach(({ disposalMethod, totalWeight }) => {
        categoryTotals[disposalMethod] = totalWeight;
    });

    return {
        tableData: [...tableData, totalsRow],
        categoryTotals,
    };
}

const WasteManagementTable: React.FC = () => {
    const { message } = App.useApp();
    const { disposalMethods, isLoading } = useWasteRecordDropdownOptions();
    const [year, setYear] = useState<number>(currentYear);
    const [data, setData] = useState<{ rawData: MonthlyStatisticByYearResponse; tableData: StatisticRow[], categoryTotals: any } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [excelLoading, setExcelLoading] = useState<boolean>(false);
    const [pdfLoading, setPdfLoading] = useState<boolean>(false);

    const fetchData = async (selectedYear: number) => {
        setLoading(true);
        try {
            const res = await getWasteStatisticByYear(selectedYear);
            const transformed = transformWasteData(res.data, disposalMethods);
            setData({
                rawData: res.data,
                ...transformed
            });
        } catch (err: any) {
            message.error(err?.response?.data?.error || 'Failed to fetch waste report');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!isLoading && disposalMethods.length > 0) {
            fetchData(year);
        }
    }, [year, disposalMethods, isLoading]);

    const generateColumns = (disposalMethods: DisposalMethodWithWasteType[]) => {
        const columns: ColumnsType<StatisticRow> = [
            {
                title: "Month",
                dataIndex: "month",
                key: "month",
                fixed: "left",
            },
        ];

        disposalMethods.forEach(({ name: disposalMethod, wasteTypes }) => {
            const children = wasteTypes.map(({ name: wasteType }) => ({
                title: wasteType,
                key: `${disposalMethod}-${wasteType}`,
                render: (_: any, record: StatisticRow) =>
                    formatNumber(record.data[disposalMethod]?.[wasteType]),
            }));

            columns.push({
                title: disposalMethod,
                key: disposalMethod,
                children,
            });
        });

        return columns;
    };

    const columns = generateColumns(disposalMethods);

    const handleExportExcel = async () => {
        const confirmed = await confirmAction({
            title: 'Confirm Excel Export',
            content: `Are you sure you want to download the Excel file for ${year} waste statistic?`,
        });
        if (!confirmed) return;
        const hide = message.loading("Generating Excel...");
        try {
            setExcelLoading(true);

            var response = await exportExcelWasteStatistics({ year })
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, `Waste_Statistic_${year}.xlsx`);
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
            var response = await exportPdfWasteStatistics({ year })
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, `Waste_Statistic_${year}.pdf`);
        } catch (err: any) {
            message.error(err.message || 'Failed to generate pdf');
        } finally {
            setPdfLoading(false);
            hide();
        }
    };

    return (
        <Card title={'Statistic'} loading={loading || isLoading}>
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
                    loading={isLoading || loading}
                    columns={columns}
                    dataSource={data?.tableData || []}
                    bordered
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    pagination={false}
                    rowKey="month"
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
                        overflow: 'auto',
                    }}
                >
                    {Object.entries(data?.categoryTotals ?? {}).map(([method, value]) => (
                        <div key={method} style={{ textAlign: 'center' }}>
                            <strong>Total {method}:</strong> {formatNumber(typeof value === 'number' ? value : 0)} KG
                        </div>
                    ))}
                </div>

            </Space>
        </Card>
    );
};

export default WasteManagementTable;