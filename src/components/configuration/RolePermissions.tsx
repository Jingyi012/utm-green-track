import { useEffect, useMemo, useState } from 'react';
import { Alert, App, Button, Checkbox, Space, Spin, Tag, Typography } from 'antd';
import { DrawerForm, ProCard, ProTable, PageContainer } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { proLayoutMenuData, type AppMenuItem } from '@/lib/config/menu';
import {
  useRolePermissionMetadata,
  useRolePermissions,
  useUpdateRolePermissions,
} from '@/hook/rolePermission';
import type { AvailablePermission, Role } from '@/lib/services/rolePermission';
import { TableActionButton } from '@/components/table/TableAction';

type PageRule = {
  path: string;
  displayName: string;
  requiredPermission?: string;
  hideInMenu?: boolean;
};

type PagePreview = PageRule & {
  accessible: boolean;
  reason?: string;
};

type RoleTableRow = Role & {
  key: string;
  isLocked: boolean;
};

const arraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

const getPageRules = (
  items: AppMenuItem[],
  inheritedPermission?: string,
  parentNames: string[] = [],
): PageRule[] => {
  const pages: PageRule[] = [];

  for (const item of items) {
    const requiredPermission = item.requiredPermission ?? inheritedPermission;
    const displayName = [...parentNames, item.name].join(' > ');

    pages.push({
      path: item.path,
      displayName,
      requiredPermission,
      hideInMenu: item.hideInMenu,
    });

    if (item.children?.length) {
      pages.push(...getPageRules(item.children, requiredPermission, [...parentNames, item.name]));
    }
  }

  return pages;
};

const MENU_PAGES = getPageRules(proLayoutMenuData).filter((page) => !page.hideInMenu);

const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallbackMessage;
};

export default function RolePermissions() {
  const { message } = App.useApp();

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);

  const { roles, availablePermissions, isLoading, error, refetch } = useRolePermissionMetadata();
  const {
    rolePermissions,
    isLoading: isRolePermissionsLoading,
    error: rolePermissionError,
  } = useRolePermissions(editingRole?.id);
  const { isSaving, saveRolePermissions } = useUpdateRolePermissions();

  useEffect(() => {
    if (!editingRole) {
      setDraftPermissions((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    setDraftPermissions((prev) => (arraysEqual(prev, rolePermissions) ? prev : rolePermissions));
  }, [editingRole, rolePermissions]);

  const permissionLabelMap = useMemo(
    () =>
      availablePermissions.reduce<Record<string, string>>((acc, permission) => {
        acc[permission.name] = permission.displayName;
        return acc;
      }, {}),
    [availablePermissions],
  );

  const permissionPageMap = useMemo(
    () =>
      availablePermissions.reduce<Record<string, PageRule[]>>((acc, permission) => {
        acc[permission.name] = MENU_PAGES.filter(
          (page) => page.requiredPermission === permission.name,
        ).sort((a, b) => a.displayName.localeCompare(b.displayName));
        return acc;
      }, {}),
    [availablePermissions],
  );

  const pageAccessPreview = useMemo<PagePreview[]>(() => {
    if (!editingRole) {
      return [];
    }

    return MENU_PAGES.map((page) => {
      const hasPermission =
        !page.requiredPermission || draftPermissions.includes(page.requiredPermission);

      let reason: string | undefined;
      if (!hasPermission && page.requiredPermission) {
        reason = `Permission required: ${permissionLabelMap[page.requiredPermission] ?? page.requiredPermission}`;
      }

      return {
        ...page,
        accessible: hasPermission,
        reason,
      };
    }).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [draftPermissions, editingRole, permissionLabelMap]);

  const accessiblePages = pageAccessPreview.filter((page) => page.accessible);
  const restrictedPages = pageAccessPreview.filter((page) => !page.accessible);

  const roleRows = useMemo<RoleTableRow[]>(
    () =>
      roles
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((role) => ({
          ...role,
          key: role.id,
          isLocked: role.name === 'Admin',
        })),
    [roles],
  );

  const handlePermissionToggle = (permissionName: string, checked: boolean): void => {
    setDraftPermissions((prev) => {
      if (checked) {
        return prev.includes(permissionName) ? prev : [...prev, permissionName];
      }
      return prev.filter((permission) => permission !== permissionName);
    });
  };

  const handleOpenDrawer = (role: Role): void => {
    setEditingRole(role);
  };

  const handleCloseDrawer = (): void => {
    setEditingRole(null);
  };

  const handleSavePermissions = async (): Promise<boolean> => {
    if (!editingRole) {
      return false;
    }

    try {
      await saveRolePermissions(editingRole.id, draftPermissions);
      message.success(`Permissions updated for ${editingRole.name}`);
      setEditingRole(null);
      return true;
    } catch (saveError) {
      message.error(getErrorMessage(saveError, 'Failed to update role permissions'));
      return false;
    }
  };

  const roleColumns: ProColumns<RoleTableRow>[] = [
    {
      title: 'Role',
      dataIndex: 'name',
      render: (_, row) => (
        <Space>
          <span>{row.name}</span>
          {row.isLocked && <Tag color="default">System Role</Tag>}
        </Space>
      ),
    },
    {
      title: 'Scope',
      key: 'scope',
      search: false,
      render: () => (
        <Typography.Text type="secondary">
          Configure accessible pages by selecting permissions.
        </Typography.Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      valueType: 'option',
      width: 150,
      search: false,
      render: (_, row) => [
        <TableActionButton
          key={`manage-${row.id}`}
          tone="primary"
          onClick={() => handleOpenDrawer(row)}
          disabled={row.isLocked}
        >
          Manage
        </TableActionButton>,
      ],
    },
  ];

  const hasError = error || rolePermissionError;

  return (
    <PageContainer title="Role Permissions Configuration" style={{ minHeight: '500px' }}>
      <Spin spinning={isLoading}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {hasError && (
            <Alert
              type="error"
              message="Unable to load role permissions"
              description={getErrorMessage(hasError, 'Please refresh and try again.')}
              showIcon
            />
          )}

          <ProTable<RoleTableRow>
            rowKey="id"
            headerTitle={'Role Permission'}
            columns={roleColumns}
            dataSource={roleRows}
            search={false}
            pagination={false}
            cardBordered
            loading={isLoading}
            options={{
              reload: () => refetch(),
            }}
          />
        </Space>
      </Spin>

      <DrawerForm
        title={editingRole ? `Manage Access: ${editingRole.name}` : 'Manage Access'}
        open={!!editingRole}
        width={780}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDrawer();
          }
        }}
        onFinish={handleSavePermissions}
        submitter={{
          searchConfig: {
            submitText: 'Save',
            resetText: 'Cancel',
          },
          submitButtonProps: {
            loading: isSaving,
          },
          resetButtonProps: {
            onClick: (event) => {
              event.preventDefault();
              handleCloseDrawer();
            },
          },
        }}
      >
        <Spin spinning={isRolePermissionsLoading}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              type="info"
              showIcon
              message="How to use"
              description="Tick the permissions below and use the preview to confirm exactly which pages this role can access."
            />

            {availablePermissions.map((permission: AvailablePermission) => (
              <ProCard key={permission.name} bordered>
                <Checkbox
                  checked={draftPermissions.includes(permission.name)}
                  disabled={isSaving}
                  onChange={(event) =>
                    handlePermissionToggle(permission.name, event.target.checked)
                  }
                >
                  <Typography.Text strong>{permission.displayName}</Typography.Text>
                </Checkbox>
                <Typography.Paragraph
                  type="secondary"
                  style={{ marginBottom: 0, marginLeft: 24, marginTop: 6 }}
                >
                  {permission.description}
                </Typography.Paragraph>

                {(permissionPageMap[permission.name] ?? []).length > 0 && (
                  <div style={{ marginLeft: 24, marginTop: 8 }}>
                    <Typography.Text type="secondary">Pages:</Typography.Text>
                    <div style={{ marginTop: 6 }}>
                      <Space wrap size={[4, 6]}>
                        {permissionPageMap[permission.name].map((page) => (
                          <Tag key={`${permission.name}-${page.path}`}>{page.displayName}</Tag>
                        ))}
                      </Space>
                    </div>
                  </div>
                )}
              </ProCard>
            ))}

            <ProCard title="Page Access Preview" bordered>
              <Typography.Text strong>{`Can Access (${accessiblePages.length})`}</Typography.Text>
              <div style={{ marginTop: 8, marginBottom: 12 }}>
                <Space wrap size={[4, 6]}>
                  {accessiblePages.map((page) => (
                    <Tag color="green" key={`allow-${page.path}`}>
                      {page.displayName}
                    </Tag>
                  ))}
                </Space>
              </div>

              <Typography.Text strong>{`Restricted (${restrictedPages.length})`}</Typography.Text>
              <div style={{ marginTop: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {restrictedPages.map((page) => (
                    <Space key={`deny-${page.path}`} wrap>
                      <Tag>{page.displayName}</Tag>
                      <Typography.Text type="secondary">{page.reason}</Typography.Text>
                    </Space>
                  ))}
                </Space>
              </div>
            </ProCard>
          </Space>
        </Spin>
      </DrawerForm>
    </PageContainer>
  );
}
