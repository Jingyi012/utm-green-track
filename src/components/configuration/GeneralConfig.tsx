import { useWasteRecordDropdownOptions } from '@/hook/options';
import { useConfigList, useUpdateConfig } from '@/hook/configurations';
import { Config } from '@/lib/types/typing';
import { EditOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Alert, Button, Select, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';

const LANDFILLING_COST_PREFIX = 'LandfillingCost';
const UTM_POPULATION_PREFIX = 'UTMPopulation';
const CONFIG_START_YEAR = 2020;

type YearFilterValue = number | 'all';

interface CampusYearConfigRow {
  key: string;
  campus: string;
  year: number;
  value: string;
}

interface CampusYearConfigDefinition {
  title: string;
  prefix: string;
  defaultValue: string;
  valueLabel: string;
  valueType: 'number' | 'string';
}

type ConfigFormValues = {
  key: string;
  value: string | number;
};

const CONFIG_DEFINITIONS: Record<'landfilling' | 'population', CampusYearConfigDefinition> = {
  landfilling: {
    title: 'Landfilling Cost by Campus and Year',
    prefix: LANDFILLING_COST_PREFIX,
    defaultValue: '146',
    valueLabel: 'Cost',
    valueType: 'number',
  },
  population: {
    title: 'UTM Population by Campus and Year',
    prefix: UTM_POPULATION_PREFIX,
    defaultValue: '0',
    valueLabel: 'Population',
    valueType: 'number',
  },
};

const toCampusToken = (campusName: string): string =>
  campusName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

const buildCampusYearKey = (prefix: string, campusName: string, year: number): string =>
  `${prefix}_${toCampusToken(campusName)}_${year}`;

const buildYearOptions = (currentYear: number): number[] =>
  Array.from(
    { length: currentYear - CONFIG_START_YEAR + 1 },
    (_, index) => CONFIG_START_YEAR + index,
  ).sort((a, b) => b - a);

const CampusYearConfigTable: React.FC<{ definition: CampusYearConfigDefinition }> = ({
  definition,
}) => {
  const { campuses, isLoading: isCampusLoading } = useWasteRecordDropdownOptions();

  const [selectedYear, setSelectedYear] = useState<YearFilterValue>(new Date().getFullYear());
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const campusNames = useMemo(() => campuses.map((campus) => campus.name), [campuses]);

  const yearsToDisplay = useMemo(
    () => (selectedYear === 'all' ? buildYearOptions(currentYear) : [selectedYear]),
    [currentYear, selectedYear],
  );

  const availableYears = useMemo(() => buildYearOptions(currentYear), [currentYear]);

  const {
    data: configList = [],
    isFetching: isConfigFetching,
    isError,
    error,
  } = useConfigList({
    prefix: definition.prefix,
    year: selectedYear === 'all' ? undefined : selectedYear,
  });

  const { mutateAsync: updateConfig, isPending: isUpdating } = useUpdateConfig();

  const rows = useMemo<CampusYearConfigRow[]>(() => {
    if (campusNames.length === 0) {
      return [];
    }

    const configMap = new Map(configList.map((item) => [item.key, item.value]));

    return campusNames.flatMap((campusName) =>
      yearsToDisplay.map((year) => {
        const key = buildCampusYearKey(definition.prefix, campusName, year);

        return {
          key,
          campus: campusName,
          year,
          value: configMap.get(key) ?? definition.defaultValue,
        };
      }),
    );
  }, [campusNames, configList, definition.defaultValue, definition.prefix, yearsToDisplay]);

  const loading = isCampusLoading || isConfigFetching || isUpdating;

  const closeModal = () => {
    setSelectedConfig(null);
    setModalOpen(false);
  };

  const handleEditConfig = async (values: ConfigFormValues) => {
    try {
      await updateConfig({
        key: values.key,
        value: String(values.value),
      });

      closeModal();
      return true;
    } catch {
      return false;
    }
  };

  const columns: ProColumns<CampusYearConfigRow>[] = useMemo(
    () => [
      {
        title: 'Campus',
        dataIndex: 'campus',
        width: 280,
      },
      {
        title: 'Year',
        dataIndex: 'year',
        width: 120,
        align: 'center',
      },
      {
        title: definition.valueLabel,
        dataIndex: 'value',
        align: 'center',
        render: (_, record) =>
          definition.valueType === 'number' ? Number(record.value).toLocaleString() : record.value,
      },
      {
        title: 'Action',
        valueType: 'option',
        align: 'center',
        render: (_: unknown, record) => (
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedConfig({
                key: record.key,
                value: record.value,
              });
              setModalOpen(true);
            }}
          />
        ),
      },
    ],
    [definition.valueLabel, definition.valueType],
  );

  return (
    <>
      {isError && (
        <Alert
          type="error"
          showIcon
          message="Unable to load configuration"
          description={error instanceof Error ? error.message : 'Failed to fetch configuration'}
          style={{ marginBottom: 16 }}
        />
      )}

      <ProTable<CampusYearConfigRow>
        headerTitle={definition.title}
        loading={loading}
        rowKey="key"
        dataSource={rows}
        columns={columns}
        search={false}
        pagination={false}
        toolBarRender={() => [
          <Space key="year-filter" align="center">
            <Typography.Text type="secondary">Year</Typography.Text>
            <Select<YearFilterValue>
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ minWidth: 140 }}
              options={[
                { label: 'All Years', value: 'all' },
                ...availableYears.map((year) => ({
                  label: String(year),
                  value: year,
                })),
              ]}
            />
          </Space>,
        ]}
      />

      <ModalForm<ConfigFormValues>
        title={`Edit ${definition.valueLabel}`}
        open={modalOpen}
        initialValues={
          selectedConfig
            ? {
                key: selectedConfig.key,
                value:
                  definition.valueType === 'number'
                    ? Number(selectedConfig.value)
                    : selectedConfig.value,
              }
            : {
                key: '',
                value: definition.valueType === 'number' ? 0 : '',
              }
        }
        modalProps={{
          destroyOnHidden: true,
          onCancel: closeModal,
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
        onFinish={handleEditConfig}
        submitter={{
          searchConfig: {
            submitText: 'Submit',
          },
        }}
      >
        <ProFormText label="Key" name="key" rules={[{ required: true }]} disabled />

        {definition.valueType === 'number' ? (
          <ProFormDigit
            label={definition.valueLabel}
            name="value"
            rules={[{ required: true, message: `${definition.valueLabel} is required` }]}
            fieldProps={{
              min: 0,
              precision: 2,
            }}
            placeholder={`Please enter ${definition.valueLabel.toLowerCase()}`}
          />
        ) : (
          <ProFormText
            label={definition.valueLabel}
            name="value"
            rules={[{ required: true, message: `${definition.valueLabel} is required` }]}
            placeholder={`Please enter ${definition.valueLabel.toLowerCase()}`}
          />
        )}
      </ModalForm>
    </>
  );
};

export const LandfillingCostConfig: React.FC = () => (
  <PageContainer title="Landfilling Cost Configuration" style={{ minHeight: '500px' }}>
    <CampusYearConfigTable definition={CONFIG_DEFINITIONS.landfilling} />
  </PageContainer>
);

export const UtmPopulationConfig: React.FC = () => (
  <PageContainer title="UTM Population Configuration" style={{ minHeight: '500px' }}>
    <CampusYearConfigTable definition={CONFIG_DEFINITIONS.population} />
  </PageContainer>
);
