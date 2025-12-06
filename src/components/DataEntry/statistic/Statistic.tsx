'use client';

import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Space,
    App,
    Col,
    Row,
} from 'antd';
import {
    FilePdfOutlined,
    FileExcelOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import { exportExcelWasteStatistics, exportPdfWasteReport, exportPdfWasteStatistics, getWasteStatisticByYear } from '@/lib/services/wasteRecord';
import { formatNumber } from '@/lib/utils/formatter';
import { useConfirmAction } from '@/hook/confirmAction';
import { MonthlyStatisticByYearResponse } from '@/lib/types/wasteSummary';
import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from '@/hook/options';
import { MONTH_LABELS_SHORT } from '@/lib/enum/monthName';
import { DisposalMethodWithWasteType } from '@/lib/types/typing';
import { ColumnsType } from 'antd/es/table';
import { downloadFile } from '@/lib/utils/downloadFile';
import { PageContainer, ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { WhiteBgWrapper } from '@/components/wrapper/whiteBgWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { ExportWasteReportModal } from '@/components/dataEntry/statistic/ExportWasteReportModal';

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
    const { isAdmin } = useAuth();
    const confirmAction = useConfirmAction();
    const { departments, isLoading: isDepartmentLoading } = useProfileDropdownOptions();
    const { disposalMethods, campuses, isLoading } = useWasteRecordDropdownOptions();
    const [year, setYear] = useState<number>(currentYear);
    const [data, setData] = useState<{ rawData: MonthlyStatisticByYearResponse; tableData: StatisticRow[], categoryTotals: any } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [excelLoading, setExcelLoading] = useState<boolean>(false);
    const [pdfLoading, setPdfLoading] = useState<boolean>(false);
    const [reportLoading, setReportLoading] = useState<boolean>(false);
    const [selectedCampus, setSelectedCampus] = useState<string | undefined>(undefined);
    const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
    const [selectedUnit, setSelectedUnit] = useState<string | undefined>(undefined);
    const [exportReportModalOpen, setExportReportModalOpen] = useState<boolean>(false);

    const fetchData = async (selectedYear: number) => {
        setLoading(true);
        try {
            const res = await getWasteStatisticByYear({
                year: selectedYear,
                campusId: selectedCampus,
                departmentId: selectedDepartment,
                unit: selectedUnit,
                isViewAll: isAdmin ? true : false
            });
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
    }, [isLoading, disposalMethods]);

    useEffect(() => {
        if (disposalMethods.length === 0) return;
        fetchData(year);
    }, [year, selectedCampus, selectedDepartment, selectedUnit, disposalMethods]);

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

    const getLocationContext = (campusId?: string, departmentId?: string, unit?: string) => {
        const campusName = campusId ? campuses.find(c => c.id === campusId)?.name : undefined;
        const departmentName = departmentId ? departments.find(d => d.id === departmentId)?.name : undefined;
        const unitName = unit?.trim() || undefined;

        const parts: string[] = [];

        if (campusName) parts.push(campusName);
        if (departmentName) parts.push(departmentName);
        if (unitName) parts.push(unitName);

        if (parts.length === 0) return "";

        return ` for ${parts.join(", ")}`;
    };


    const handleExportExcel = async () => {
        const context = getLocationContext(selectedCampus, selectedDepartment, selectedUnit);
        const confirmed = await confirmAction({
            title: 'Confirm Excel Export',
            content: `Are you sure you want to download the ${year} waste statistics${context}?`,
        });
        if (!confirmed) return;
        const hide = message.loading("Generating Excel...");
        try {
            setExcelLoading(true);

            var response = await exportExcelWasteStatistics({
                year,
                campusId: selectedCampus,
                departmentId: selectedDepartment,
                unit: selectedUnit,
                isViewAll: isAdmin ? true : false
            });
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, `Waste_Statistic_${year}.xlsx`);
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Failed to generate excel');
        } finally {
            setExcelLoading(false);
            hide();
        }
    };

    const handleExportPDF = async () => {
        const context = getLocationContext(selectedCampus, selectedDepartment, selectedUnit);
        const confirmed = await confirmAction({
            title: 'Confirm PDF Export',
            content: `Are you sure you want to download the ${year} waste statistics${context}?`,
        });
        if (!confirmed) return;
        const hide = message.loading("Generating PDF...");
        try {
            setPdfLoading(true);
            var response = await exportPdfWasteStatistics({
                year,
                campusId: selectedCampus,
                departmentId: selectedDepartment,
                unit: selectedUnit,
                isViewAll: isAdmin ? true : false
            });
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, `Waste_Statistic_${year}.pdf`);
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Failed to generate pdf');
        } finally {
            setPdfLoading(false);
            hide();
        }
    };

    const handleDownloadWasteReport = async (year: number, campusId?: string, departmentId?: string, unit?: string) => {
        const context = getLocationContext(campusId, departmentId, unit);
        const confirmed = await confirmAction({
            title: 'Confirm Excel Export',
            content: `Are you sure you want to download the ${year} waste report${context}?`,
        });
        if (!confirmed) return;
        const hide = message.loading("Generating waste report...");
        try {
            setReportLoading(true);
            var response = await exportPdfWasteReport({
                year,
                campusId,
                departmentId,
                unit,
                isViewAll: isAdmin ? true : false
            });
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, `Waste_Report${year}.pdf`);
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Failed to generate waste report');
        } finally {
            setReportLoading(false);
            hide();
        }
    }

    return (
        <PageContainer title={'Statistic'} loading={isLoading || isDepartmentLoading}>
            <WhiteBgWrapper>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Header */}
                    <Row gutter={[16, 16]} justify="space-between" align="middle">
                        {/* Filters Section */}
                        <Col flex="auto">
                            <ProForm submitter={false}>
                                <Space wrap size="middle">
                                    <ProFormSelect
                                        name="year"
                                        initialValue={year}
                                        onChange={setYear}
                                        style={{ width: 100 }}
                                        options={yearOptions}
                                        placeholder="Year"
                                        label="Year"
                                        fieldProps={{
                                            showSearch: true,
                                            optionFilterProp: "label",
                                        }}
                                    />

                                    <ProFormSelect
                                        name="campus"
                                        initialValue={selectedCampus}
                                        onChange={setSelectedCampus}
                                        style={{ minWidth: 250, width: 'auto' }}
                                        label="Campus"
                                        placeholder="Campus"
                                        options={campuses.map((c) => ({
                                            label: c.name,
                                            value: c.id,
                                        }))}
                                        fieldProps={{
                                            showSearch: true,
                                            optionFilterProp: "label",
                                        }}
                                        allowClear
                                    />

                                    <ProFormSelect
                                        name="department"
                                        initialValue={selectedDepartment}
                                        onChange={setSelectedDepartment}
                                        style={{ minWidth: 350, width: 'auto' }}
                                        label="Department"
                                        placeholder="Department"
                                        options={departments.map((d) => ({
                                            label: d.name,
                                            value: d.id,
                                        }))}
                                        fieldProps={{
                                            showSearch: true,
                                            optionFilterProp: "label",
                                        }}
                                        allowClear
                                    />
                                    <ProFormText
                                        name="unit"
                                        label="PTJ / Unit"
                                        placeholder="Enter PTJ / Unit"
                                        fieldProps={{
                                            onBlur: (e) => {
                                                const value = e.target.value.trim();
                                                setSelectedUnit(value);
                                            }
                                        }}
                                    />
                                </Space>
                            </ProForm>
                        </Col>

                        {/* Export Section */}
                        <Col>
                            <Space>
                                <Button
                                    loading={excelLoading}
                                    icon={<FileExcelOutlined />}
                                    onClick={handleExportExcel}
                                >
                                    Waste Stats (Excel)
                                </Button>
                                <Button
                                    loading={pdfLoading}
                                    icon={<FilePdfOutlined />}
                                    danger
                                    onClick={handleExportPDF}
                                >
                                    Waste Stats (PDF)
                                </Button>
                                <Button
                                    loading={reportLoading}
                                    icon={<DownloadOutlined />}
                                    color='primary'
                                    variant='outlined'
                                    onClick={() => setExportReportModalOpen(true)}
                                >
                                    Waste Report
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                    {/* Table */}

                    <Table
                        loading={isLoading || loading || isDepartmentLoading}
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
            </WhiteBgWrapper>
            <ExportWasteReportModal
                open={!!exportReportModalOpen}
                onCancel={
                    () => setExportReportModalOpen(false)
                }
                onConfirm={handleDownloadWasteReport}
                campuses={campuses}
                departments={departments}
                isAdmin={isAdmin}
            />
        </PageContainer>
    );
};

export default WasteManagementTable;