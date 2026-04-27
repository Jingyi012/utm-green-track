import { useEffect, useState } from 'react';
import InfoCardGrid from './InfoCardGrid';
import { App, Empty, Skeleton, Space } from 'antd';
import { getYearlyDataAnalytics } from '@/lib/services/wasteRecord';
import { YearlyDataAnalyticsResponse } from '@/lib/types/dataAnalytics';
import { useWasteRecordDropdownOptions } from '@/hook/options';
import React from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { AnalyticsFilters } from '@/components/dataAnalytics/analytics/AnalyticsFilters';
import { WasteGenerationTrendChart } from '@/components/dataAnalytics/analytics/charts/WasteGenerationTrendChart';
import WasteCompositionGrid from '../dataAnalytics/analytics/WasteComposition/WasteCompositionGrid';

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response?.data &&
    typeof (error as { response?: { data?: unknown } }).response?.data === 'object'
  ) {
    const responseData = (error as { response?: { data?: { error?: string; message?: string } } })
      .response?.data;
    return responseData?.error || responseData?.message || fallback;
  }

  return fallback;
}

const DashboardSection: React.FC = () => {
  const { message } = App.useApp();
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const yearOptions = Array.from({ length: currentYear - startYear + 1 }, (_, i) => {
    const year = startYear + i;
    return { label: year.toString(), value: year };
  }).reverse();
  const { campuses } = useWasteRecordDropdownOptions();
  const [selectedCampus, setSelectedCampus] = useState<string>();
  const [year, setYear] = useState(currentYear);
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<YearlyDataAnalyticsResponse | null>(null);
  const campusOptions = campuses.map((campus) => ({
    label: campus.name,
    value: campus.id,
  }));

  const fetchData = async () => {
    if (!selectedCampus) {
      return;
    }

    try {
      setChartLoading(true);
      const analyticsResponse = await getYearlyDataAnalytics({
        campusId: selectedCampus,
        year,
      });

      if (!analyticsResponse?.success || !analyticsResponse?.data) {
        message.error('Failed to fetch analytics data');
        return;
      }

      setAnalyticsData(analyticsResponse.data);
    } catch (error: unknown) {
      message.error(getRequestErrorMessage(error, 'Failed to fetch dashboard data'));
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
    if (year && selectedCampus) fetchData();
  }, [year, selectedCampus]);

  return (
    <PageContainer title="Dashboard">
      {/* Main Vertical Layout: size 24 provides better breathing room for large dashboards */}
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* SECTION 1: Filters */}
        <AnalyticsFilters
          year={year}
          campusId={selectedCampus}
          yearOptions={yearOptions}
          campusOptions={campusOptions}
          onYearChange={setYear}
          onCampusChange={setSelectedCampus}
        />

        <Skeleton active loading={chartLoading}>
          {analyticsData ? (
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              {/* SECTION 2: Metrics Overview */}
              <InfoCardGrid
                totalWasteGenerated={analyticsData.wasteGeneration.totalWasteGeneratedTonnes}
                totalWasteDiverted={analyticsData.wasteGeneration.totalWasteDivertedTonnes}
                totalWasteToLandfill={analyticsData.wasteGeneration.totalWasteToLandfillTonnes}
                wasteDiversionRate={analyticsData.wasteDiversion.wasteDiversionRatePercent}
                wasteRecyclingRate={analyticsData.wasteDiversion.recyclingRatePercent}
                totalGhgReduction={analyticsData.wasteDiversion.estimatedGhgReductionKgCo2e}
                wasteTypeBreakdownByDisposalMethod={
                  analyticsData.wasteGeneration.wasteTypeBreakdownByDisposalMethod
                }
              />

              {/* SECTION 3: Trend Chart */}
              <ProCard bordered>
                <WasteGenerationTrendChart
                  title={'UTM Solid Waste Generation Trends'}
                  data={analyticsData.wasteGeneration.wasteGenerationTrend}
                />
              </ProCard>

              {/* SECTION 4: Waste Composition Grid */}
              <WasteCompositionGrid
                recycledWasteTypeComposition={
                  analyticsData.wasteDiversion.recycledWasteTypeComposition
                }
                compostingWasteTypeComposition={
                  analyticsData.wasteDiversion.compostingWasteTypeComposition
                }
                energyRecoveryWasteTypeComposition={
                  analyticsData.wasteDiversion.energyRecoveryWasteTypeComposition
                }
              />
            </Space>
          ) : (
            <ProCard ghost>
              <Empty description="No dashboard analytics data available." />
            </ProCard>
          )}
        </Skeleton>
      </Space>
    </PageContainer>
  );
};

export default DashboardSection;
