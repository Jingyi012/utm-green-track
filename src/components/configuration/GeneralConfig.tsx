import { useWasteRecordDropdownOptions } from '@/hook/options';
import { configQueryKeys, useConfigList, useUpdateConfig } from '@/hook/configurations';
import { Config } from '@/lib/types/typing';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Select, Space, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { TableActionButton } from '@/components/table/TableAction';

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

type AddYearFormValues = {
  year: number;
  sourceYear: number | 'default';
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

const parseConfigYear = (prefix: string, key: string): number | null => {
  const normalizedPrefix = `${prefix}_`;

  if (!key.startsWith(normalizedPrefix)) {
    return null;
  }

  const segments = key.split('_');
  const yearSegment = segments.at(-1);

  if (!yearSegment) {
    return null;
  }

  const parsedYear = Number(yearSegment);
  return Number.isInteger(parsedYear) ? parsedYear : null;
};

const buildYearOptions = (configuredYears: number[]): number[] =>
  Array.from(new Set(configuredYears)).sort((a, b) => b - a);

const CampusYearConfigTable: React.FC<{ definition: CampusYearConfigDefinition }> = ({
  definition,
}) => {
  const queryClient = useQueryClient();
  const { campuses, isLoading: isCampusLoading } = useWasteRecordDropdownOptions();

  const [selectedYear, setSelectedYear] = useState<YearFilterValue>(new Date().getFullYear());
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addYearModalOpen, setAddYearModalOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const campusNames = useMemo(() => campuses.map((campus) => campus.name), [campuses]);

  const {
    data: configList = [],
    isFetching: isConfigFetching,
    isError,
    error,
    refetch,
  } = useConfigList({
    prefix: definition.prefix,
  });

  const { mutateAsync: updateConfig, isPending: isUpdating } = useUpdateConfig();
  const { mutateAsync: initializeConfig, isPending: isInitializing } = useUpdateConfig({
    invalidateOnSuccess: false,
    successMessage: false,
  });

  const availableYears = useMemo(
    () =>
      buildYearOptions(
        configList
          .map((config) => parseConfigYear(definition.prefix, config.key))
          .filter((year): year is number => year !== null),
      ),
    [configList, definition.prefix],
  );

  const yearsToDisplay = useMemo(
    () => (selectedYear === 'all' ? availableYears : [selectedYear]),
    [availableYears, selectedYear],
  );

  const configMap = useMemo(
    () => new Map(configList.map((item) => [item.key, item.value])),
    [configList],
  );

  const latestConfiguredYear = availableYears[0];

  const addYearSourceOptions = useMemo(
    () => [
      { label: 'Use default values', value: 'default' as const },
      ...availableYears.map((year) => ({
        label: `Copy from ${year}`,
        value: year,
      })),
    ],
    [availableYears],
  );

  useEffect(() => {
    if (selectedYear === 'all' || availableYears.length === 0) {
      return;
    }

    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const rows = useMemo<CampusYearConfigRow[]>(() => {
    if (campusNames.length === 0) {
      return [];
    }

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
  }, [campusNames, configMap, definition.defaultValue, definition.prefix, yearsToDisplay]);

  const loading = isCampusLoading || isConfigFetching || isUpdating || isInitializing;

  const closeModal = () => {
    setSelectedConfig(null);
    setModalOpen(false);
  };

  const closeAddYearModal = () => {
    setAddYearModalOpen(false);
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

  const handleAddYear = async (values: AddYearFormValues) => {
    if (campusNames.length === 0) {
      message.warning('No campuses available to initialize.');
      return false;
    }

    if (availableYears.includes(values.year)) {
      message.warning(`Configuration for year ${values.year} already exists.`);
      return false;
    }

    try {
      await Promise.all(
        campusNames.map((campusName) => {
          const key = buildCampusYearKey(definition.prefix, campusName, values.year);
          const sourceValue =
            values.sourceYear === 'default'
              ? null
              : configMap.get(buildCampusYearKey(definition.prefix, campusName, values.sourceYear));

          return initializeConfig({
            key,
            value: sourceValue ?? definition.defaultValue,
          });
        }),
      );

      await queryClient.invalidateQueries({
        queryKey: configQueryKeys.lists(),
      });

      message.success(`${definition.title} for ${values.year} has been initialized.`);
      setSelectedYear(values.year);
      closeAddYearModal();
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
          <TableActionButton
            tone="edit"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedConfig({
                key: record.key,
                value: record.value,
              });
              setModalOpen(true);
            }}
          >
            Edit
          </TableActionButton>
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
        options={{
          reload: () => refetch(),
        }}
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
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddYearModalOpen(true)}>
              Add Year
            </Button>
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

      <ModalForm<AddYearFormValues>
        title={`Add ${definition.valueLabel} Year`}
        open={addYearModalOpen}
        initialValues={{
          year: Math.max(currentYear + 1, (latestConfiguredYear ?? currentYear) + 1),
          sourceYear: latestConfiguredYear ?? 'default',
        }}
        modalProps={{
          destroyOnHidden: true,
          onCancel: closeAddYearModal,
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeAddYearModal();
          }
        }}
        onFinish={handleAddYear}
        submitter={{
          searchConfig: {
            submitText: 'Initialize Year',
          },
        }}
      >
        <ProFormDigit
          label="Year"
          name="year"
          rules={[{ required: true, message: 'Year is required' }]}
          fieldProps={{
            min: CONFIG_START_YEAR,
            precision: 0,
          }}
          placeholder="Please enter year"
        />

        <ProFormSelect
          label="Initial Values"
          name="sourceYear"
          rules={[{ required: true, message: 'Please select how to initialize the year' }]}
          options={addYearSourceOptions}
        />
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
