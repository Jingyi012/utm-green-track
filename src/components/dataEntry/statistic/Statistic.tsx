import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Space, App, Col, Row } from 'antd';
import { FilePdfOutlined, FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  exportExcelWasteStatistics,
  exportPdfWasteReport,
  exportPdfWasteStatistics,
  getWasteStatisticByYear,
} from '@/lib/services/wasteRecord';
import { getProfile } from '@/lib/services/user';
import { formatNumber } from '@/lib/utils/formatter';
import { useConfirmAction } from '@/hook/confirmAction';
import { MonthlyStatisticByYearResponse } from '@/lib/types/wasteSummary';
import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from '@/hook/options';
import { MONTH_LABELS_SHORT } from '@/lib/enum/monthName';
import { DisposalMethodWithWasteType } from '@/lib/types/typing';
import { ColumnsType } from 'antd/es/table';
import { downloadFile } from '@/lib/utils/downloadFile';
import { PageContainer, ProForm, ProFormSelect } from '@ant-design/pro-components';
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
const startYear = 2020;
const yearOptions = Array.from({ length: currentYear - startYear + 1 }, (_, i) => ({
  label: (startYear + i).toString(),
  value: startYear + i,
})).reverse();

const transformWasteData = (
  rawData: MonthlyStatisticByYearResponse,
  disposalMethods: DisposalMethodWithWasteType[],
) => {
  const monthLabels = MONTH_LABELS_SHORT;
  const allWasteMap: Record<string, string[]> = {};

  disposalMethods.forEach(({ name: disposalMethod, wasteTypes }) => {
    allWasteMap[disposalMethod] = wasteTypes.map((wt) => wt.name);
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
      types.forEach((type) => {
        row.data[method][type] = 0;
      });
    }

    // Fill actual values if available
    const summary = rawData.monthlyWasteSummary.find((m) => m.month === i + 1);
    if (summary) {
      summary.wasteTypeTotals.forEach(({ disposalMethod, wasteType, totalWeight }) => {
        row.data[disposalMethod][wasteType] = totalWeight;
      });
    }

    tableData.push(row);
  }

  // Build totals row (same structure as monthly rows)
  const totalsRow: StatisticRow = {
    month: 'Total',
    data: {},
  };

  // Initialize with 0
  for (const [method, types] of Object.entries(allWasteMap)) {
    totalsRow.data[method] = {};
    types.forEach((type) => {
      totalsRow.data[method][type] = 0;
    });
  }

  // Fill actual totals
  rawData.wasteTypeTotals.forEach(({ disposalMethod, wasteType, totalWeight }) => {
    totalsRow.data[disposalMethod][wasteType] = totalWeight;
  });

  // Rebuild category total (for summary display)
  const categoryTotals: Record<string, number> = {};
  Object.keys(allWasteMap).forEach((method) => {
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
};

const WasteManagementTable: React.FC = () => {
  const { message } = App.useApp();
  const { isAdmin } = useAuth();
  const confirmAction = useConfirmAction();
  const { departments, isLoading: isDepartmentLoading } = useProfileDropdownOptions();
  const { disposalMethods, campuses, isLoading } = useWasteRecordDropdownOptions();
  const [year, setYear] = useState<number>(currentYear);
  const [data, setData] = useState<{
    rawData: MonthlyStatisticByYearResponse;
    tableData: StatisticRow[];
    categoryTotals: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [excelLoading, setExcelLoading] = useState<boolean>(false);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [selectedCampus, setSelectedCampus] = useState<string | undefined>(undefined);
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const [scopeLoading, setScopeLoading] = useState<boolean>(!isAdmin);
  const [exportReportModalOpen, setExportReportModalOpen] = useState<boolean>(false);

  const canFetchForUser = !!selectedCampus && !!selectedDepartment;

  const getRequiredFilterWarning = (): string => {
    if (!selectedCampus) return 'Please select UTM Campus first.';
    if (!selectedDepartment) return 'Please select Faculty / Department / College / PTJ first.';
    return 'Please complete required filters.';
  };

  const getRequestErrorMessage = (error: unknown, fallback: string): string => {
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
  };

  const fetchData = useCallback(
    async (selectedYear: number) => {
      if (!isAdmin && !canFetchForUser) {
        setData(null);
        return;
      }

      setLoading(true);
      try {
        const res = await getWasteStatisticByYear({
          year: selectedYear,
          campusId: selectedCampus,
          departmentId: selectedDepartment,
          isViewAll: isAdmin,
        });
        const transformed = transformWasteData(res.data, disposalMethods);
        setData({
          rawData: res.data,
          ...transformed,
        });
      } catch (error: unknown) {
        message.error(getRequestErrorMessage(error, 'Failed to fetch waste report'));
      }
      setLoading(false);
    },
    [canFetchForUser, disposalMethods, isAdmin, message, selectedCampus, selectedDepartment],
  );

  useEffect(() => {
    if (isAdmin) {
      setScopeLoading(false);
      return;
    }

    const loadUserProfile = async () => {
      try {
        setScopeLoading(true);
        const profileResponse = await getProfile();
        const profile = profileResponse.data;
        setSelectedDepartment(profile.departmentId);
      } catch (error: unknown) {
        message.error(getRequestErrorMessage(error, 'Failed to load user scope'));
      } finally {
        setScopeLoading(false);
      }
    };

    loadUserProfile();
  }, [isAdmin, message]);

  useEffect(() => {
    if (selectedCampus || campuses.length === 0) return;
    setSelectedCampus(campuses[0].id);
  }, [campuses, selectedCampus]);

  useEffect(() => {
    if (scopeLoading) return;
    if (isLoading) return;
    if (disposalMethods.length === 0) return;
    fetchData(year);
  }, [
    disposalMethods,
    fetchData,
    isLoading,
    scopeLoading,
    year,
    selectedCampus,
    selectedDepartment,
  ]);

  const generateColumns = (disposalMethods: DisposalMethodWithWasteType[]) => {
    const columns: ColumnsType<StatisticRow> = [
      {
        title: 'Month',
        dataIndex: 'month',
        key: 'month',
        fixed: 'left',
      },
    ];

    disposalMethods.forEach(({ name: disposalMethod, wasteTypes }) => {
      const children = wasteTypes.map(({ name: wasteType }) => ({
        title: wasteType,
        key: `${disposalMethod}-${wasteType}`,
        render: (_: unknown, record: StatisticRow) =>
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

  const getLocationContext = (campusId?: string, departmentId?: string) => {
    const campusName = campusId ? campuses.find((c) => c.id === campusId)?.name : undefined;
    const departmentName = departmentId
      ? departments.find((d) => d.id === departmentId)?.name
      : undefined;

    const parts: string[] = [];

    if (campusName) parts.push(campusName);
    if (departmentName) parts.push(departmentName);

    if (parts.length === 0) return '';

    return ` for ${parts.join(', ')}`;
  };

  const handleExportExcel = async () => {
    if (!isAdmin && !canFetchForUser) {
      message.warning(getRequiredFilterWarning());
      return;
    }

    const context = getLocationContext(selectedCampus, selectedDepartment);
    const confirmed = await confirmAction({
      title: 'Confirm Excel Export',
      content: `Are you sure you want to download the ${year} waste statistics${context}?`,
    });
    if (!confirmed) return;
    const hide = message.loading('Generating Excel...', 0);
    try {
      setExcelLoading(true);

      const response = await exportExcelWasteStatistics({
        year,
        campusId: selectedCampus,
        departmentId: selectedDepartment,
        isViewAll: isAdmin,
      });
      const contentDisposition = response.headers['content-disposition'];
      downloadFile(response.data, contentDisposition, `Waste_Statistic_${year}.xlsx`);
    } catch (error: unknown) {
      message.error(getRequestErrorMessage(error, 'Failed to generate excel'));
    } finally {
      setExcelLoading(false);
      hide();
    }
  };

  const handleExportPDF = async () => {
    if (!isAdmin && !canFetchForUser) {
      message.warning(getRequiredFilterWarning());
      return;
    }

    const context = getLocationContext(selectedCampus, selectedDepartment);
    const confirmed = await confirmAction({
      title: 'Confirm PDF Export',
      content: `Are you sure you want to download the ${year} waste statistics${context}?`,
    });
    if (!confirmed) return;
    const hide = message.loading('Generating PDF...', 0);
    try {
      setPdfLoading(true);
      const response = await exportPdfWasteStatistics({
        year,
        campusId: selectedCampus,
        departmentId: selectedDepartment,
        isViewAll: isAdmin,
      });
      const contentDisposition = response.headers['content-disposition'];
      downloadFile(response.data, contentDisposition, `Waste_Statistic_${year}.pdf`);
    } catch (error: unknown) {
      message.error(getRequestErrorMessage(error, 'Failed to generate pdf'));
    } finally {
      setPdfLoading(false);
      hide();
    }
  };

  const handleDownloadWasteReport = async (
    year: number,
    campusId?: string,
    departmentId?: string,
  ) => {
    const campusFilter = isAdmin ? campusId : selectedCampus;
    const departmentFilter = isAdmin ? departmentId : selectedDepartment;

    if (!campusFilter) {
      message.warning('Please select UTM Campus first.');
      return;
    }

    if (!isAdmin && !departmentFilter) {
      message.warning('Please select Faculty / Department / College / PTJ first.');
      return;
    }

    const hide = message.loading('Generating waste report...', 0);
    try {
      setReportLoading(true);
      const response = await exportPdfWasteReport({
        year,
        campusId: campusFilter,
        departmentId: departmentFilter,
        isViewAll: isAdmin,
      });
      const contentDisposition = response.headers['content-disposition'];
      downloadFile(response.data, contentDisposition, `Waste_Report${year}.pdf`);
    } catch (error: unknown) {
      message.error(getRequestErrorMessage(error, 'Failed to generate waste report'));
    } finally {
      setReportLoading(false);
      hide();
    }
  };

  return (
    <PageContainer title={'Statistic'} loading={isLoading || isDepartmentLoading || scopeLoading}>
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
                    rules={[{ required: true, message: 'Year is required' }]}
                    fieldProps={{
                      value: year,
                      onChange: setYear,
                      showSearch: true,
                      optionFilterProp: 'label',
                    }}
                    style={{ width: 100 }}
                    options={yearOptions}
                    placeholder="Year"
                    label="Year"
                    allowClear={false}
                  />

                  <ProFormSelect
                    name="campus"
                    rules={
                      isAdmin ? undefined : [{ required: true, message: 'Campus is required' }]
                    }
                    fieldProps={{
                      value: selectedCampus,
                      onChange: setSelectedCampus,
                      showSearch: true,
                      optionFilterProp: 'label',
                    }}
                    style={{ minWidth: 250, width: 'auto' }}
                    label="Campus"
                    placeholder="Campus"
                    options={campuses.map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                    allowClear={isAdmin}
                  />

                  <ProFormSelect
                    name="department"
                    rules={
                      isAdmin
                        ? undefined
                        : [
                            {
                              required: true,
                              message: 'Faculty / Department / College / PTJ is required',
                            },
                          ]
                    }
                    fieldProps={{
                      value: selectedDepartment,
                      onChange: setSelectedDepartment,
                      showSearch: true,
                      optionFilterProp: 'label',
                      disabled: !isAdmin,
                    }}
                    style={{ minWidth: 350, width: 'auto' }}
                    label="Faculty / Department / College / PTJ"
                    placeholder="Faculty / Department / College / PTJ"
                    options={
                      isAdmin
                        ? departments.map((d) => ({
                            label: d.name,
                            value: d.id,
                          }))
                        : departments
                            .filter((d) => d.id === selectedDepartment)
                            .map((d) => ({ label: d.name, value: d.id }))
                    }
                    allowClear={isAdmin}
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
                  color="primary"
                  variant="outlined"
                  onClick={() => setExportReportModalOpen(true)}
                >
                  Waste Report
                </Button>
              </Space>
            </Col>
          </Row>
          {/* Table */}

          <Table
            loading={isLoading || loading || isDepartmentLoading || scopeLoading}
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
                <strong>Total {method}:</strong>{' '}
                {formatNumber(typeof value === 'number' ? value : 0)} KG
              </div>
            ))}
          </div>
        </Space>
      </WhiteBgWrapper>
      <ExportWasteReportModal
        open={!!exportReportModalOpen}
        onCancel={() => setExportReportModalOpen(false)}
        onConfirm={handleDownloadWasteReport}
        campuses={campuses}
        departments={departments}
        isAdmin={isAdmin}
      />
    </PageContainer>
  );
};

export default WasteManagementTable;
