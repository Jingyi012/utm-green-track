import { configQueryKeys, useConfigList, useUpdateConfig } from '@/hook/configurations';
import type { Config } from '@/lib/types/typing';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Col, Row, Space, Switch, Tag, Typography } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useMemo, useState } from 'react';

const NOTIFICATION_EMAIL_PREFIX = 'NotificationEmail';

interface NotificationConfigDefinition {
  group: 'admin' | 'user';
  key: string;
  title: string;
  description: string;
}

const NOTIFICATION_CONFIGS: NotificationConfigDefinition[] = [
  {
    group: 'admin',
    key: 'NotificationEmail_Admin_UserRegistration',
    title: 'Admin email for new user registration',
    description: 'Send an email to admins when a new user registers and is waiting for approval.',
  },
  {
    group: 'admin',
    key: 'NotificationEmail_Admin_RequestCreated',
    title: 'Admin email for new change request',
    description: 'Send an email to admins when a user submits a new change request.',
  },
  {
    group: 'user',
    key: 'NotificationEmail_User_RequestStatusUpdated',
    title: 'User email for request approval or rejection',
    description: 'Send an email to the requester when an admin approves or rejects a request.',
  },
  {
    group: 'admin',
    key: 'NotificationEmail_Admin_WasteRecordSubmitted',
    title: 'Admin email for waste record submission',
    description: 'Send an email to admins when a user submits waste records for review.',
  },
  {
    group: 'user',
    key: 'NotificationEmail_User_WasteRecordStatusUpdated',
    title: 'User email for waste record revision or rejection',
    description:
      'Send an email to the record owner when an admin marks a waste record as revision required or rejected.',
  },
];

const GROUP_META = {
  admin: {
    title: 'Admin Email Settings',
    description:
      'These emails help admins notice new submissions or approval work that needs attention.',
    tagLabel: 'Admin Inbox',
    tagColor: 'blue',
  },
  user: {
    title: 'User Email Settings',
    description:
      'These emails keep requesters informed when an admin updates the status of their request or waste record.',
    tagLabel: 'User Inbox',
    tagColor: 'green',
  },
} as const;

const toBoolean = (value?: string) => !value || value.toLowerCase() !== 'false';

export const NotificationEmailConfig: React.FC = () => {
  const queryClient = useQueryClient();
  const [savingKeys, setSavingKeys] = useState<string[]>([]);
  const {
    data: configs = [],
    isLoading,
    isError,
    error,
  } = useConfigList({ prefix: NOTIFICATION_EMAIL_PREFIX });
  const { mutateAsync: updateConfig } = useUpdateConfig({ invalidateOnSuccess: false });

  const configMap = useMemo(
    () => new Map(configs.map((config: Config) => [config.key, config.value])),
    [configs],
  );
  const groupedConfigs = useMemo(
    () => ({
      admin: NOTIFICATION_CONFIGS.filter((config) => config.group === 'admin'),
      user: NOTIFICATION_CONFIGS.filter((config) => config.group === 'user'),
    }),
    [],
  );

  const isSaving = (key: string) => savingKeys.includes(key);

  const handleToggle = async (key: string, checked: boolean) => {
    if (isSaving(key)) {
      return;
    }

    const queryKey = configQueryKeys.list({ prefix: NOTIFICATION_EMAIL_PREFIX });
    const nextValue = checked ? 'true' : 'false';
    const previousValue =
      (queryClient.getQueryData<Config[]>(queryKey) ?? configs).find((config) => config.key === key)
        ?.value;

    setSavingKeys((currentKeys) => [...currentKeys, key]);
    queryClient.setQueryData<Config[]>(queryKey, (currentConfigs = []) => {
      const existingConfig = currentConfigs.find((config) => config.key === key);

      if (!existingConfig) {
        return [...currentConfigs, { key, value: nextValue }];
      }

      return currentConfigs.map((config) =>
        config.key === key ? { ...config, value: nextValue } : config,
      );
    });

    try {
      await updateConfig({
        key,
        value: nextValue,
      });
    } catch {
      queryClient.setQueryData<Config[]>(queryKey, (currentConfigs = []) => {
        if (previousValue === undefined) {
          return currentConfigs.filter((config) => config.key !== key);
        }

        const hasConfig = currentConfigs.some((config) => config.key === key);

        if (!hasConfig) {
          return [...currentConfigs, { key, value: previousValue }];
        }

        return currentConfigs.map((config) =>
          config.key === key ? { ...config, value: previousValue } : config,
        );
      });
    } finally {
      setSavingKeys((currentKeys) => currentKeys.filter((currentKey) => currentKey !== key));
    }
  };

  const renderConfigItem = (config: NotificationConfigDefinition) => (
    <div
      key={config.key}
      style={{
        display: 'flex',
        gap: 16,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '18px 0',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Typography.Title level={5} style={{ marginBottom: 8 }}>
          {config.title}
        </Typography.Title>
        <Typography.Text type="secondary">{config.description}</Typography.Text>
      </div>

      <div style={{ flexShrink: 0, paddingTop: 4 }}>
        <Switch
          checked={toBoolean(configMap.get(config.key))}
          checkedChildren="Enabled"
          unCheckedChildren="Disabled"
          loading={isSaving(config.key)}
          disabled={isSaving(config.key)}
          onChange={(checked) => void handleToggle(config.key, checked)}
        />
      </div>
    </div>
  );

  return (
    <PageContainer title="Notification Email Configuration" style={{ minHeight: '500px' }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {isError && (
          <Alert
            type="error"
            showIcon
            message="Unable to load notification email configuration"
            description={error instanceof Error ? error.message : 'Failed to fetch configuration'}
          />
        )}

        <Card>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Separate email settings by recipient so it is easier to decide which events should
            reach admins for review and which status updates should go back to users.
          </Typography.Paragraph>
        </Card>

        <Row gutter={[16, 16]}>
          {(['admin', 'user'] as const).map((groupKey) => {
            const groupMeta = GROUP_META[groupKey];
            const groupItems = groupedConfigs[groupKey];

            return (
              <Col xs={24} lg={12} key={groupKey}>
                <Card
                  loading={isLoading}
                  title={
                    <Space size={8}>
                      <span>{groupMeta.title}</span>
                      <Tag color={groupMeta.tagColor}>{groupMeta.tagLabel}</Tag>
                    </Space>
                  }
                  styles={{ body: { paddingTop: 8 } }}
                >
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {groupMeta.description}
                  </Typography.Paragraph>

                  <div style={{ marginTop: 12 }}>
                    {groupItems.map((config, index) => (
                      <div
                        key={config.key}
                        style={{
                          borderBottom:
                            index === groupItems.length - 1
                              ? 'none'
                              : '1px solid rgba(5, 5, 5, 0.06)',
                        }}
                      >
                        {renderConfigItem(config)}
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Space>
    </PageContainer>
  );
};
