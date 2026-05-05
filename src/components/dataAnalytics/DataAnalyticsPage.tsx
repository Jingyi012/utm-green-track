import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { App, Button, Empty, Space, Tabs } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { DownloadOutlined } from '@ant-design/icons';
import { WhiteBgWrapper } from '@/components/wrapper/whiteBgWrapper';
import { useWasteRecordDropdownOptions } from '@/hook/options';
import { getLifetimeDataAnalytics, getYearlyDataAnalytics } from '@/lib/services/wasteRecord';
import {
  LifetimeDataAnalyticsResponse,
  YearlyDataAnalyticsResponse,
} from '@/lib/types/dataAnalytics';
import { exportDataAnalyticsPdf } from '@/lib/reportExports/dataAnalytics';
import { AnalyticsFilters } from './analytics/AnalyticsFilters';
import {
  YEARLY_ANALYTICS_SECTION_KEYS,
  YearlyAnalyticsPanel,
  YearlyAnalyticsSectionKey,
} from './analytics/YearlyAnalyticsPanel';
import { LifetimeSummarySection } from './analytics/LifetimeSummarySection';
import { YearlySummarySection } from './analytics/YearlySummarySection';
import { WasteGenerationSection } from './analytics/WasteGenerationSection';
import { WasteDiversionSection } from './analytics/WasteDiversionSection';
import { WasteManagementCostSection } from './analytics/WasteManagementCostSection';

const START_YEAR = 2020;
const CURRENT_YEAR = new Date().getFullYear();
const ANALYTICS_TAB_KEYS = ['yearly', 'lifetime'] as const;
type AnalyticsTabKey = (typeof ANALYTICS_TAB_KEYS)[number];

function isAnalyticsTabKey(value: string | null): value is AnalyticsTabKey {
  return value !== null && ANALYTICS_TAB_KEYS.includes(value as AnalyticsTabKey);
}

function isYearlySectionKey(value: string | null): value is YearlyAnalyticsSectionKey {
  return (
    value !== null && YEARLY_ANALYTICS_SECTION_KEYS.includes(value as YearlyAnalyticsSectionKey)
  );
}

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

const DataAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const searchStr = useLocation({ select: (location) => location.searchStr });
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const { message } = App.useApp();
  const { campuses, isLoading } = useWasteRecordDropdownOptions();
  const [year, setYear] = useState<number>(() => {
    const queryYear = Number(searchParams.get('year'));
    if (Number.isInteger(queryYear) && queryYear >= START_YEAR && queryYear <= CURRENT_YEAR) {
      return queryYear;
    }
    return CURRENT_YEAR;
  });
  const [campusId, setCampusId] = useState<string | undefined>(
    () => searchParams.get('campusId') || undefined,
  );
  const [activeTab, setActiveTab] = useState<AnalyticsTabKey>(() => {
    const queryTab = searchParams.get('analysisTab');
    return isAnalyticsTabKey(queryTab) ? queryTab : 'yearly';
  });
  const [yearlySection, setYearlySection] = useState<YearlyAnalyticsSectionKey>(() => {
    const querySection = searchParams.get('section');
    return isYearlySectionKey(querySection) ? querySection : 'summary';
  });
  const [yearlyLoading, setYearlyLoading] = useState<boolean>(false);
  const [lifetimeLoading, setLifetimeLoading] = useState<boolean>(false);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  const [yearlyData, setYearlyData] = useState<YearlyDataAnalyticsResponse>();
  const [lifetimeData, setLifetimeData] = useState<LifetimeDataAnalyticsResponse>();
  const [exportContainer, setExportContainer] = useState<HTMLDivElement | null>(null);
  const [lifetimeStartYear, setLifetimeStartYear] = useState<number>();
  const [lifetimeEndYear, setLifetimeEndYear] = useState<number>();

  const yearOptions = useMemo(
    () =>
      Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, index) => {
        const optionYear = START_YEAR + index;
        return { label: optionYear.toString(), value: optionYear };
      }).reverse(),
    [],
  );

  const campusOptions = useMemo(
    () => campuses.map((campus) => ({ label: campus.name, value: campus.id })),
    [campuses],
  );

  const lifetimeYearOptions = useMemo(() => {
    if (!lifetimeData) return [];

    return Array.from(
      new Set([
        ...lifetimeData.totalWasteGenerationByYear.map((item) => item.year),
        ...lifetimeData.totalWasteDiversionByYear.map((item) => item.year),
        ...lifetimeData.totalWasteManagementCostByYear.map((item) => item.year),
        ...lifetimeData.totalEstimatedSavingsFromWasteDiversionByYear.map((item) => item.year),
      ]),
    )
      .sort((a, b) => a - b)
      .map((value) => ({ label: value.toString(), value }));
  }, [lifetimeData]);

  useEffect(() => {
    if (campusOptions.length === 0) {
      setCampusId(undefined);
      return;
    }

    const hasValidSelectedCampus = campusId
      ? campusOptions.some((option) => String(option.value) === campusId)
      : false;

    if (!hasValidSelectedCampus) {
      setCampusId(String(campusOptions[0].value));
    }
  }, [campusId, campusOptions]);

  const fetchYearlyData = useCallback(async () => {
    if (!campusId) return;

    try {
      setYearlyLoading(true);
      const response = await getYearlyDataAnalytics({ year, campusId });
      setYearlyData(response.data);
    } catch (error: unknown) {
      message.error(getRequestErrorMessage(error, 'Failed to load yearly analytics'));
    } finally {
      setYearlyLoading(false);
    }
  }, [campusId, message, year]);

  const fetchLifetimeData = useCallback(async () => {
    if (!campusId) return;

    try {
      setLifetimeLoading(true);
      const response = await getLifetimeDataAnalytics({ campusId });
      setLifetimeData(response.data);
    } catch (error: unknown) {
      message.error(getRequestErrorMessage(error, 'Failed to load lifetime analytics'));
    } finally {
      setLifetimeLoading(false);
    }
  }, [campusId, message]);

  useEffect(() => {
    fetchYearlyData();
  }, [fetchYearlyData]);

  useEffect(() => {
    fetchLifetimeData();
  }, [fetchLifetimeData]);

  useEffect(() => {
    if (lifetimeYearOptions.length === 0) {
      setLifetimeStartYear(undefined);
      setLifetimeEndYear(undefined);
      return;
    }

    const values = lifetimeYearOptions.map((option) => Number(option.value));
    const latestYear = values[values.length - 1];
    const defaultStartYear = values[Math.max(0, values.length - 10)];

    setLifetimeStartYear((current) =>
      current !== undefined && values.includes(current) ? current : defaultStartYear,
    );
    setLifetimeEndYear((current) =>
      current !== undefined && values.includes(current) ? current : latestYear,
    );
  }, [lifetimeYearOptions]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchStr);
    let hasChanges = false;

    const setParam = (key: string, value: string | undefined) => {
      const current = nextParams.get(key);
      if (!value) {
        if (current !== null) {
          nextParams.delete(key);
          hasChanges = true;
        }
        return;
      }

      if (current !== value) {
        nextParams.set(key, value);
        hasChanges = true;
      }
    };

    setParam('analysisTab', activeTab);
    setParam('section', yearlySection);
    setParam('year', String(year));
    setParam('campusId', campusId);

    if (hasChanges) {
      const queryString = nextParams.toString();
      void navigate({
        href: queryString ? `${pathname}?${queryString}` : pathname,
        replace: true,
        resetScroll: false,
      });
    }
  }, [activeTab, campusId, navigate, pathname, searchStr, year, yearlySection]);

  const handleDownloadPdf = async () => {
    if (!campusId) {
      message.warning('Please select a campus before downloading.');
      return;
    }

    if (!yearlyData && !lifetimeData) {
      message.warning('No analytics data available to download.');
      return;
    }

    const campusNameForExport =
      yearlyData?.campusName ||
      lifetimeData?.campusName ||
      campusOptions.find((option) => String(option.value) === campusId)?.label ||
      'Campus';

    try {
      setDownloadLoading(true);
      if (!exportContainer) {
        message.warning('No analytics content available to export.');
        return;
      }

      await exportDataAnalyticsPdf({
        container: exportContainer,
        campusName: String(campusNameForExport),
        periodLabel:
          activeTab === 'yearly'
            ? String(year)
            : `${lifetimeStartYear ?? '-'} - ${lifetimeEndYear ?? '-'}`,
        analysisTab: activeTab,
      });
    } catch {
      message.error('Failed to generate analytics PDF.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const downloadButton = (
    <Button
      key="download-analytics-pdf"
      type="primary"
      icon={<DownloadOutlined />}
      loading={downloadLoading}
      disabled={yearlyLoading || lifetimeLoading || (!yearlyData && !lifetimeData)}
      onClick={() => {
        void handleDownloadPdf();
      }}
    >
      Download PDF
    </Button>
  );

  return (
    <PageContainer title="Data Analytics" loading={isLoading}>
      <WhiteBgWrapper>
        <ProCard direction="column" split="horizontal" ghost>
          <Space
            direction="vertical"
            size={16}
            style={{ width: '100%' }}
            styles={{ item: { width: '100%' } }}
          >
            <ProCard bordered>
              <Tabs
                activeKey={activeTab}
                destroyOnHidden
                animated={false}
                onChange={(key) => setActiveTab(key as AnalyticsTabKey)}
                items={[
                  {
                    key: 'yearly',
                    label: 'Yearly Analysis',
                    children: (
                      <Space
                        direction="vertical"
                        size={16}
                        style={{ width: '100%' }}
                        styles={{ item: { width: '100%' } }}
                      >
                        <AnalyticsFilters
                          year={year}
                          campusId={campusId}
                          yearOptions={yearOptions}
                          campusOptions={campusOptions}
                          onYearChange={setYear}
                          onCampusChange={setCampusId}
                          actionNode={downloadButton}
                        />
                        <ProCard loading={yearlyLoading} ghost>
                          {yearlyData ? (
                            <YearlyAnalyticsPanel
                              data={yearlyData}
                              activeSection={yearlySection}
                              onSectionChange={setYearlySection}
                            />
                          ) : (
                            <Empty description="No yearly analytics data available." />
                          )}
                        </ProCard>
                      </Space>
                    ),
                  },
                  {
                    key: 'lifetime',
                    label: 'Lifetime Analysis',
                    children: (
                      <Space
                        direction="vertical"
                        size={16}
                        style={{ width: '100%' }}
                        styles={{ item: { width: '100%' } }}
                      >
                        <AnalyticsFilters
                          campusId={campusId}
                          campusOptions={campusOptions}
                          onCampusChange={setCampusId}
                          startYear={lifetimeStartYear}
                          endYear={lifetimeEndYear}
                          rangeYearOptions={lifetimeYearOptions}
                          onStartYearChange={(value) => {
                            setLifetimeStartYear(value);
                            if (lifetimeEndYear !== undefined && value > lifetimeEndYear) {
                              setLifetimeEndYear(value);
                            }
                          }}
                          onEndYearChange={(value) => {
                            setLifetimeEndYear(value);
                            if (lifetimeStartYear !== undefined && value < lifetimeStartYear) {
                              setLifetimeStartYear(value);
                            }
                          }}
                          actionNode={downloadButton}
                        />
                        <ProCard loading={lifetimeLoading} ghost>
                          {lifetimeData ? (
                            <LifetimeSummarySection
                              data={lifetimeData}
                              startYear={lifetimeStartYear}
                              endYear={lifetimeEndYear}
                              onStartYearChange={setLifetimeStartYear}
                              onEndYearChange={setLifetimeEndYear}
                              showControls={false}
                            />
                          ) : (
                            <Empty description="No lifetime analytics data available." />
                          )}
                        </ProCard>
                      </Space>
                    ),
                  },
                ]}
              />
            </ProCard>
            <div
              ref={setExportContainer}
              style={{
                position: 'absolute',
                left: '-100000px',
                top: 0,
                width: 1200,
                padding: 24,
                background: '#fff',
              }}
            >
              {activeTab === 'yearly' && yearlyData ? (
                <Space
                  direction="vertical"
                  size={16}
                  style={{ width: '100%' }}
                  styles={{ item: { width: '100%' } }}
                >
                  <YearlySummarySection data={yearlyData.summary} />
                  <WasteGenerationSection data={yearlyData.wasteGeneration} />
                  <WasteDiversionSection data={yearlyData.wasteDiversion} />
                  <WasteManagementCostSection data={yearlyData.wasteManagementCost} />
                </Space>
              ) : null}
              {activeTab === 'lifetime' && lifetimeData ? (
                <LifetimeSummarySection
                  data={lifetimeData}
                  startYear={lifetimeStartYear}
                  endYear={lifetimeEndYear}
                  onStartYearChange={setLifetimeStartYear}
                  onEndYearChange={setLifetimeEndYear}
                  showControls={false}
                />
              ) : null}
            </div>
          </Space>
        </ProCard>
      </WhiteBgWrapper>
    </PageContainer>
  );
};

export default DataAnalyticsPage;
