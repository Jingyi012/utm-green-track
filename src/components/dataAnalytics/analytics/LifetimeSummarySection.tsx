import { Empty, Select, Space, Typography } from 'antd';
import { Column } from '@ant-design/charts';
import { ProCard } from '@ant-design/pro-components';
import { useEffect, useMemo, useState } from 'react';
import { LifetimeDataAnalyticsResponse } from '@/lib/types/dataAnalytics';
import {
  COLORS,
  DEFAULT_WASTE_BAR_COLOR,
  DISPOSAL_METHOD_COLOR_SCALE,
} from '@/lib/utils/disposalMethodChart';
import { formatFixed } from './helpers';

const { Text } = Typography;

interface LifetimeSummarySectionProps {
  data: LifetimeDataAnalyticsResponse;
  startYear?: number;
  endYear?: number;
  onStartYearChange?: (year: number) => void;
  onEndYearChange?: (year: number) => void;
  showControls?: boolean;
}

export function LifetimeSummarySection({
  data,
  startYear: controlledStartYear,
  endYear: controlledEndYear,
  onStartYearChange,
  onEndYearChange,
  showControls = true,
}: LifetimeSummarySectionProps) {
  const availableYears = useMemo(
    () =>
      Array.from(
        new Set([
          ...data.totalWasteGenerationByYear.map((item) => item.year),
          ...data.totalWasteDiversionByYear.map((item) => item.year),
          ...data.totalWasteManagementCostByYear.map((item) => item.year),
          ...data.totalEstimatedSavingsFromWasteDiversionByYear.map((item) => item.year),
        ]),
      ).sort((a, b) => a - b),
    [
      data.totalEstimatedSavingsFromWasteDiversionByYear,
      data.totalWasteDiversionByYear,
      data.totalWasteGenerationByYear,
      data.totalWasteManagementCostByYear,
    ],
  );
  const [internalStartYear, setInternalStartYear] = useState<number>();
  const [internalEndYear, setInternalEndYear] = useState<number>();

  const startYear = controlledStartYear ?? internalStartYear;
  const endYear = controlledEndYear ?? internalEndYear;

  const handleStartYearChange = (value: number) => {
    if (onStartYearChange) {
      onStartYearChange(value);
      return;
    }
    setInternalStartYear(value);
  };

  const handleEndYearChange = (value: number) => {
    if (onEndYearChange) {
      onEndYearChange(value);
      return;
    }
    setInternalEndYear(value);
  };

  useEffect(() => {
    if (availableYears.length === 0) {
      if (!onStartYearChange) {
        setInternalStartYear(undefined);
      }
      if (!onEndYearChange) {
        setInternalEndYear(undefined);
      }
      return;
    }

    const latestYear = availableYears[availableYears.length - 1];
    const defaultStartYear = availableYears[Math.max(0, availableYears.length - 10)];

    if (controlledStartYear === undefined) {
      setInternalStartYear(defaultStartYear);
    }
    if (controlledEndYear === undefined) {
      setInternalEndYear(latestYear);
    }
  }, [availableYears, controlledEndYear, controlledStartYear, onEndYearChange, onStartYearChange]);

  const filteredGenerationData = useMemo(
    () =>
      data.totalWasteGenerationByYear.filter(
        (item) =>
          (startYear === undefined || item.year >= startYear) &&
          (endYear === undefined || item.year <= endYear),
      ),
    [data.totalWasteGenerationByYear, endYear, startYear],
  );
  const filteredDiversionData = useMemo(
    () =>
      data.totalWasteDiversionByYear.filter(
        (item) =>
          (startYear === undefined || item.year >= startYear) &&
          (endYear === undefined || item.year <= endYear),
      ),
    [data.totalWasteDiversionByYear, endYear, startYear],
  );
  const filteredCostData = useMemo(
    () =>
      data.totalWasteManagementCostByYear.filter(
        (item) =>
          (startYear === undefined || item.year >= startYear) &&
          (endYear === undefined || item.year <= endYear),
      ),
    [data.totalWasteManagementCostByYear, endYear, startYear],
  );
  const filteredSavingsData = useMemo(
    () =>
      data.totalEstimatedSavingsFromWasteDiversionByYear.filter(
        (item) =>
          (startYear === undefined || item.year >= startYear) &&
          (endYear === undefined || item.year <= endYear),
      ),
    [data.totalEstimatedSavingsFromWasteDiversionByYear, endYear, startYear],
  );

  const hasData =
    filteredGenerationData.length > 0 ||
    filteredDiversionData.length > 0 ||
    filteredCostData.length > 0 ||
    filteredSavingsData.length > 0;

  if (!hasData) {
    return <Empty description="No lifetime data available." />;
  }

  const generationConfig = {
    title: 'UTM Total Waste Generation by Year',
    data: filteredGenerationData,
    xField: 'year',
    yField: 'totalWeightTonnes',
    colorField: 'disposalMethod',
    scale: DISPOSAL_METHOD_COLOR_SCALE,
    stack: true,
    axis: {
      x: { title: 'Year' },
      y: { title: 'Weight (tonnes)' },
    },
    legend: { position: 'top' },
    interactions: [{ type: 'active-region', enable: true }],
    tooltip: {
      items: [
        (datum: { disposalMethod: string; totalWeightTonnes: number }) => ({
          name: datum.disposalMethod,
          value: `${formatFixed(datum.totalWeightTonnes)} tonnes`,
        }),
      ],
    },
    annotations: Object.entries(
      filteredGenerationData.reduce((acc: Record<string, number>, curr) => {
        acc[curr.year] = (acc[curr.year] || 0) + curr.totalWeightTonnes;
        return acc;
      }, {}),
    ).map(([year, total]) => ({
      type: 'text',
      data: [{ year: Number(year), totalWeightTonnes: total }],
      encode: { x: 'year', y: 'totalWeightTonnes' },
      style: {
        text: `${total.toFixed(2)}`,
        textBaseline: 'bottom',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#000',
        dy: -2,
      },
      tooltip: false,
    })),
  };

  const diversionConfig = {
    title: 'UTM Total Waste Diversion by Year',
    data: filteredDiversionData,
    xField: 'year',
    yField: 'totalWeightTonnes',
    colorField: 'disposalMethod',
    scale: DISPOSAL_METHOD_COLOR_SCALE,
    stack: true,
    axis: {
      x: { title: 'Year' },
      y: { title: 'Weight (tonnes)' },
    },
    legend: { position: 'top' },
    interactions: [{ type: 'active-region', enable: true }],
    tooltip: {
      items: [
        (datum: { disposalMethod: string; totalWeightTonnes: number }) => ({
          name: datum.disposalMethod,
          value: `${formatFixed(datum.totalWeightTonnes)} tonnes`,
        }),
      ],
    },
    annotations: Object.entries(
      filteredDiversionData.reduce((acc: Record<string, number>, curr) => {
        acc[curr.year] = (acc[curr.year] || 0) + curr.totalWeightTonnes;
        return acc;
      }, {}),
    ).map(([year, total]) => ({
      type: 'text',
      data: [{ year: Number(year), totalWeightTonnes: total }],
      encode: { x: 'year', y: 'totalWeightTonnes' },
      style: {
        text: `${total.toFixed(2)}`,
        textBaseline: 'bottom',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#000',
        dy: -2,
      },
      tooltip: false,
    })),
  };

  const costConfig = {
    title: 'UTM Total Waste Management Cost by Year',
    data: filteredCostData,
    xField: 'year',
    yField: 'totalCostRm',
    style: { fill: COLORS.gray },
    axis: {
      x: { title: 'Year' },
      y: { title: 'Cost (RM)' },
    },
    legend: false,
    interactions: [{ type: 'active-region', enable: true }],
    tooltip: {
      items: [
        (datum: { totalCostRm: number }) => ({
          name: 'Management Cost',
          value: `RM ${formatFixed(datum.totalCostRm)}`,
        }),
      ],
    },
    annotations: filteredCostData.map((item) => ({
      type: 'text',
      data: [{ year: item.year, totalCostRm: item.totalCostRm }],
      encode: { x: 'year', y: 'totalCostRm' },
      style: {
        text: `RM ${item.totalCostRm.toFixed(2)}`,
        textBaseline: 'bottom',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#000',
        dy: -2,
      },
      tooltip: false,
    })),
  };

  const savingsConfig = {
    title: 'UTM Est. Savings From Waste Diversion by Year',
    data: filteredSavingsData,
    xField: 'year',
    yField: 'totalCostRm',
    color: DEFAULT_WASTE_BAR_COLOR,
    axis: {
      x: { title: 'Year' },
      y: { title: 'Savings (RM)' },
    },
    legend: false,
    interactions: [{ type: 'active-region', enable: true }],
    tooltip: {
      items: [
        (datum: { totalCostRm: number }) => ({
          name: 'Est. Savings',
          value: `RM ${formatFixed(datum.totalCostRm)}`,
        }),
      ],
    },
    annotations: filteredSavingsData.map((item) => ({
      type: 'text',
      data: [{ year: item.year, totalCostRm: item.totalCostRm }],
      encode: { x: 'year', y: 'totalCostRm' },
      style: {
        text: `RM ${item.totalCostRm.toFixed(2)}`,
        textBaseline: 'bottom',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#000',
        dy: -2,
      },
      tooltip: false,
    })),
  };

  const yearOptions = availableYears.map((year) => ({ label: year.toString(), value: year }));

  return (
    <ProCard direction="column" ghost>
      <Space
        direction="vertical"
        size={16}
        style={{ width: '100%' }}
        styles={{ item: { width: '100%' } }}
      >
        {showControls ? (
          <Space wrap size={12} align="center">
            <Text strong>Year Range</Text>
            <Select
              value={startYear}
              options={yearOptions}
              style={{ width: 120 }}
              onChange={(value) => {
                handleStartYearChange(value);
                if (endYear !== undefined && value > endYear) {
                  handleEndYearChange(value);
                }
              }}
            />
            <Text type="secondary">to</Text>
            <Select
              value={endYear}
              options={yearOptions}
              style={{ width: 120 }}
              onChange={(value) => {
                handleEndYearChange(value);
                if (startYear !== undefined && value < startYear) {
                  handleStartYearChange(value);
                }
              }}
            />
          </Space>
        ) : null}
        <div data-analytics-export-section="lifetime-generation">
          <ProCard bordered>
            <Column {...generationConfig} />
          </ProCard>
        </div>
        <div data-analytics-export-section="lifetime-diversion">
          <ProCard bordered>
            <Column {...diversionConfig} />
          </ProCard>
        </div>
        <div data-analytics-export-section="lifetime-cost">
          <ProCard bordered>
            <Column {...costConfig} />
          </ProCard>
        </div>
        <div data-analytics-export-section="lifetime-savings">
          <ProCard bordered>
            <Column {...savingsConfig} />
          </ProCard>
        </div>
      </Space>
    </ProCard>
  );
}
