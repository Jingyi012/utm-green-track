'use client'
import { useEffect, useState } from "react";
import InfoCardGrid from "./InfoCardGrid";
import { App, Card, Col, Divider, Row, Select, Skeleton, Splitter } from "antd";
import { getCampusYearlySummary } from "@/lib/services/wasteRecord";
import { Column, Pie } from "@ant-design/charts";
import { CampusYearlySummaryResponse, MonthlyWasteSummary, TotalSummary } from "@/lib/types/wasteSummary";
import { useWasteRecordDropdownOptions } from "@/hook/options";
import { MONTH_LABELS_SHORT } from "@/lib/enum/monthName";
import React from "react";
import { PageContainer } from "@ant-design/pro-components";

export interface ChartDataItem {
    month: string;
    disposalMethod: string;
    //wasteType: string;
    totalWeight: number;
}

export interface PieChartData {
    wasteType: string,
    disposalMethod: string;
    totalWeight: number
}

export function transformMonthlyChartData(
    rawData: MonthlyWasteSummary[],
    disposalMethods: string[],
): ChartDataItem[] {
    const monthLabels = MONTH_LABELS_SHORT;

    // Initialize all months × disposalMethods with 0
    const chartData: ChartDataItem[] = monthLabels.flatMap((monthName, monthIndex) =>
        disposalMethods.map(method => ({
            month: monthName,
            disposalMethod: method,
            totalWeight: 0,
        }))
    );

    // Build a lookup for quick update
    const lookup = new Map<string, ChartDataItem>();
    chartData.forEach(item => {
        lookup.set(`${item.month}_${item.disposalMethod}`, item);
    });

    // Apply actual rawData if any
    rawData.forEach(summary => {
        const monthName = monthLabels[summary.month - 1];

        summary.wasteTypeTotals.forEach(total => {
            const key = `${monthName}_${total.disposalMethod}`;
            const existing = lookup.get(key);
            if (existing) {
                existing.totalWeight += total.totalWeight;
            }
        });
    });

    return chartData;
}

function transformRecyclableWasteType(
    monthlyWasteSummary: MonthlyWasteSummary[]
): PieChartData[] {
    const totals: Record<string, Record<string, number>> = {};

    monthlyWasteSummary.forEach((monthData) => {
        monthData.wasteTypeTotals.forEach((item) => {
            if (item.disposalMethod !== "Landfilling") {
                if (!totals[item.disposalMethod]) {
                    totals[item.disposalMethod] = {};
                }
                totals[item.disposalMethod][item.wasteType] =
                    (totals[item.disposalMethod][item.wasteType] || 0) + item.totalWeight;
            }
        });
    });

    const result: PieChartData[] = [];
    Object.entries(totals).forEach(([disposalMethod, wasteTypes]) => {
        Object.entries(wasteTypes).forEach(([wasteType, totalWeight]) => {
            result.push({
                disposalMethod,
                wasteType,
                totalWeight: parseFloat(totalWeight.toFixed(2)),
            });
        });
    });

    return result;
}

const DashboardSection: React.FC = () => {
    const { message } = App.useApp();
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(
        { length: currentYear - 2023 + 1 },
        (_, i) => {
            const year = 2023 + i;
            return { label: year.toString(), value: year };
        }
    ).reverse();
    const { campuses, disposalMethods } = useWasteRecordDropdownOptions();
    const [selectedCampus, setSelectedCampus] = useState<string>();
    const [year, setYear] = useState(currentYear);
    const [chartLoading, setChartLoading] = useState<boolean>(false);
    const [summary, setSummary] = useState<TotalSummary>({
        totalWasteGenerated: 0,
        totalWasteRecycled: 0,
        totalWasteToLandfill: 0,
        totalGhgReduction: 0,
        totalLandfillCostSavings: 0,
    });
    const [campusYearlySummary, setCampusYearlySummary] = useState<CampusYearlySummaryResponse>();
    const [monthlyChartData, setMonthlyChartData] = useState<ChartDataItem[]>([]);
    const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
    const [sizes, setSizes] = React.useState<(number | string)[]>(['60%', '40%']);

    const fecthMonthlyData = async () => {
        try {
            setChartLoading(true);

            const response = await getCampusYearlySummary(selectedCampus!, year);
            if (!response?.success || !response?.data) {
                return;
            }

            const { totalSummary, monthlyWasteSummary } = response.data;

            setCampusYearlySummary(response.data);

            if (totalSummary) {
                setSummary(totalSummary);
            }

            if (monthlyWasteSummary?.length) {
                const disposalMethodNames = disposalMethods.map(method => method.name);

                const chartData = transformMonthlyChartData(
                    monthlyWasteSummary,
                    disposalMethodNames
                );
                setMonthlyChartData(chartData);

                const pieChart = transformRecyclableWasteType(monthlyWasteSummary);
                setPieChartData(pieChart);
            }

        } catch {
            message.error("Failed to fetch monthly data")
        } finally {
            setChartLoading(false);
        }
    };

    useEffect(() => {
        if (campuses && campuses.length > 0) {
            setSelectedCampus(campuses[0].id);
        }
    }, [campuses]);

    useEffect(() => {
        if (year && selectedCampus)
            fecthMonthlyData();
    }, [year, selectedCampus]);


    const totals: Record<string, number> = monthlyChartData.reduce((acc, curr) => {
        acc[curr.month] = (acc[curr.month] || 0) + curr.totalWeight;
        return acc;
    }, {});

    const config = {
        title: "UTM Solid Waste Generation Trends",
        data: monthlyChartData,
        xField: 'month',
        yField: 'totalWeight',
        stack: true,
        colorField: 'disposalMethod',
        scale: {
            color: {
                domain: ['Landfilling', 'Recycling', 'Composting', 'Energy Recovery'],
                range: ['#727272ff', '#2ffa14ff', '#ee752fff', '#1867ddff'],
            }
        },
        legend: {
            position: 'top',
        },
        xAxis: {
            label: {
                autoRotate: false,
            },
        },
        axis: {
            x: { title: 'MONTHS', tickCount: 24 },
            y: { title: 'WEIGHT (TONNES)', grid: true },
        },
        interactions: [
            {
                type: 'active-region',
                enable: true,
            },
        ],
        tooltip: {
            items: [
                (datum: { totalWeight: number; }) => ({
                    value: `${datum.totalWeight.toFixed(2)
                        }`,
                }),
            ],
        },
        annotations: Object.entries(totals).map(([month, total]) => ({
            type: 'text',
            data: [{ month, totalWeight: total }], // Fake data point for positioning
            encode: { x: 'month', y: 'totalWeight' },
            style: {
                text: `${total.toFixed(2)}`,
                textBaseline: 'bottom', // Sit on top of the bar
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                fill: '#000', // Black text
                dy: -2, // Move up slightly
            },
            tooltip: false, // Disable tooltip for this text
        })),
    };
    const totalSum = pieChartData.reduce((acc, curr) => acc + curr.totalWeight, 0);
    const pieConfig = {
        title: "Statistics of recyclable items by waste type",
        data: pieChartData,
        angleField: 'totalWeight',
        colorField: 'wasteType',
        radius: 0.8,
        innerRadius: 0.5,
        label: {
            text: (d) => {
                const percent = (d.totalWeight / totalSum) * 100;
                return `${d.wasteType}\n${percent.toFixed(1)}%`;
            },
            position: 'outside',
            style: {
                fontWeight: 'bold',
            },
        },
        annotations: [
            {
                type: 'text',
                style: {
                    text: `Total\n${totalSum.toFixed(2)} Tonnes`,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 16,
                    fontStyle: 'bold',
                },
                tooltip: false,
            },
        ],
        legend: {
            color: {
                title: false,
                position: 'right',
                rowPadding: 5,
            },
        },
        tooltip: {
            title: (datum: { disposalMethod: any; wasteType: any; }) => ({
                value: `${datum.disposalMethod} - ${datum.wasteType} `,
            }),
            items: [
                (datum: { totalWeight: number; }) => ({
                    name: 'Total Weight',
                    value: `${datum.totalWeight.toFixed(2)} Tonnes`,
                }),
            ],
        },
    };

    return (
        <PageContainer title={"Dashboard"}>
            <Row gutter={16} wrap align="middle" justify="space-between" >
                <Col xs={24} sm={12} md={8}>
                    <label>UTM Campus</label>
                    <Select
                        placeholder="Choose a campus"
                        value={selectedCampus}
                        onChange={(value) => setSelectedCampus(value)}
                        options={(campuses).map((campus) => ({
                            label: campus.name,
                            value: campus.id,
                        }))}
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <label>Year</label>
                    <Select
                        placeholder="Choose a year"
                        value={year}
                        onChange={(value) => setYear(value)}
                        options={yearOptions}
                        style={{ width: '100%' }}
                    />
                </Col>
            </Row>
            <br />
            <Skeleton loading={chartLoading}>
                <InfoCardGrid {...summary} wasteTypeTotals={campusYearlySummary?.wasteTypeTotals} />
                <br />
                <div style={{ backgroundColor: 'white' }}>
                    <Splitter
                        onResize={setSizes}
                        style={{}}
                    >
                        <Splitter.Panel size={sizes[0]} resizable={true}>
                            <Column {...config} />
                        </Splitter.Panel>
                        <Splitter.Panel size={sizes[1]}>
                            <Pie {...pieConfig} />
                        </Splitter.Panel>
                    </Splitter>
                </div>
            </Skeleton>
        </PageContainer>
    )
}

export default DashboardSection;