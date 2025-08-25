'use client';

import { useProfileDropdownOptions } from "@/hook/options";
import { UserStatus, userStatusLabels } from "@/lib/enum/status";
import { getAllUsers, updateUserApprovalStatus } from "@/lib/services/user";
import { UserDetails } from "@/lib/types/typing";
import { ActionType, FooterToolbar, ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Button, Popconfirm, Tabs, Tag } from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useState, useEffect, useRef } from "react";

const UserApproval: React.FC = () => {
    const { message } = App.useApp();
    const { positions, departments, roles, isLoading } = useProfileDropdownOptions();
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPagesize] = useState<number>(20);
    const [data, setData] = useState<UserDetails[]>([]);
    const [statusFilter, setStatusFilter] = useState<UserStatus>(UserStatus.Pending);
    const [selectedRows, setSelectedRows] = useState<UserDetails[]>([]);
    const actionRef = useRef<ActionType | undefined>(undefined);

    // Fetch users based on status, page, pageSize
    const fetchData = async (filter: {
        pageNumber: number,
        pageSize: number,
        name?: string,
        email?: string,
        contactNumber?: string,
        positionId?: string,
        departmentId?: string,
        status?: number,
    }) => {
        setLoading(true);
        try {
            const res = await getAllUsers({
                ...filter,
            });
            setData(res.data || []);
            setPage(res.pageNumber);
            setPagesize(res.pageSize);
            return {
                data: res.data,
                success: res.success,
                total: res.totalCount
            }
        } catch (err) {
            message.error("Failed to fetch users");
            setData([]);
            return {
                data: [],
                success: false,
                total: 0
            }
        } finally {
            setLoading(false);
        }
    };

    // Batch or single approve/reject
    const handleStatusUpdate = async (users: UserDetails[], status: UserStatus) => {
        if (!users.length) return;
        try {
            const userIds = users.map(u => u.id);
            const res = await updateUserApprovalStatus({ userIds, status });
            if (res.success) {
                message.success(`User status updated to ${userStatusLabels[status]}`);
            } else {
                message.error(`Failed to update status to ${userStatusLabels[status]}`);
            }
            setSelectedRows([]);
            actionRef.current?.reload();
        } catch {
            message.error(`Failed to update status to ${userStatusLabels[status]}`);
        }
    };

    const columns: ProColumns<UserDetails>[] = [
        {
            title: "No.",
            render: (_: any, __: any, index: number) =>
                (page - 1) * pageSize + index + 1,
            width: 60,
            align: "center",
            hideInSearch: true,
        },
        { title: "Name", dataIndex: "name", align: "center" },
        { title: "Email", dataIndex: "email", align: "center" },
        { title: "Contact", dataIndex: "contactNumber", align: "center" },
        { title: "Staff / Matric No", dataIndex: "staffMatricNo", align: "center" },
        {
            title: "Position",
            dataIndex: "positionId",
            align: "center",
            valueEnum: positions.reduce((acc, method) => {
                acc[method.id] = { text: method.name };
                return acc;
            }, {} as Record<string, { text: string }>),
            render: (_, record) => record.position ?? "-",
        },
        {
            title: "Department",
            dataIndex: "departmentId",
            align: "center",
            valueEnum: departments.reduce((acc, method) => {
                acc[method.id] = { text: method.name };
                return acc;
            }, {} as Record<string, { text: string }>),
            render: (_, record) => record.department ?? "-",
        },
        {
            title: "Role",
            dataIndex: "roles",
            align: "center",
            valueEnum: roles.reduce((acc, role) => {
                acc[role.id] = { text: role.name };
                return acc;
            }, {} as Record<string, { text: string }>),
            render: (_, record) => {
                if (!record.roles || record.roles.length === 0) return "-";

                return (
                    <>
                        {record.roles.map((roleId) => {
                            const role = roles.find(r => r.id === roleId);
                            return (
                                <Tag key={roleId}>
                                    {role ? role.name : roleId} {/* fallback if not found */}
                                </Tag>
                            );
                        })}
                    </>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            align: "center",
            hideInSearch: true,
            valueEnum: {
                [UserStatus.Pending]: {
                    text: userStatusLabels[UserStatus.Pending],
                    status: "Default",
                },
                [UserStatus.Approved]: {
                    text: userStatusLabels[UserStatus.Approved],
                    status: "Success",
                },
                [UserStatus.Rejected]: {
                    text: userStatusLabels[UserStatus.Rejected],
                    status: "Error",
                },
            },
        },
        {
            title: "Action",
            align: "center",
            hideInSearch: true,
            render: (_, record) => {
                if (record.status === UserStatus.Pending) {
                    return (
                        <>
                            <Button
                                type="link"
                                onClick={() => handleStatusUpdate([record], UserStatus.Approved)}
                                loading={loading}
                            >
                                Approve
                            </Button>
                            <Popconfirm
                                title="Reject this user?"
                                onConfirm={() => handleStatusUpdate([record], UserStatus.Rejected)}
                            >
                                <Button type="link" danger loading={loading}>
                                    Reject
                                </Button>
                            </Popconfirm>
                        </>
                    );
                }
                else if (record.status === UserStatus.Approved) {
                    return (
                        <>
                            <Popconfirm
                                title="Reject this user?"
                                onConfirm={() => handleStatusUpdate([record], UserStatus.Rejected)}
                            >
                                <Button type="link" danger loading={loading}>
                                    Reject
                                </Button>
                            </Popconfirm>
                        </>
                    );
                }
                else if (record.status === UserStatus.Rejected) {
                    return (
                        <>
                            <Button
                                type="link"
                                onClick={() => handleStatusUpdate([record], UserStatus.Approved)}
                                loading={loading}
                            >
                                Approve
                            </Button>

                        </>
                    );
                }
                return "-";
            },
        },
    ];

    useEffect(() => {
        actionRef.current?.reload();
    }, [statusFilter])

    return (
        <>
            <Tabs
                activeKey={statusFilter.toString()}
                onChange={(key) => {
                    setStatusFilter(parseInt(key) as UserStatus);
                    setSelectedRows([]);
                    setPage(1);
                }}
                style={{ marginBottom: 16 }}
                items={[
                    {
                        key: UserStatus.Pending.toString(),
                        label: userStatusLabels[UserStatus.Pending],
                    },
                    {
                        key: UserStatus.Approved.toString(),
                        label: userStatusLabels[UserStatus.Approved],
                    },
                    {
                        key: UserStatus.Rejected.toString(),
                        label: userStatusLabels[UserStatus.Rejected],
                    },
                ]}
            />

            <ProTable<UserDetails>
                rowKey="id"
                headerTitle="User List"
                actionRef={actionRef}
                loading={loading || isLoading}
                columns={columns}
                dataSource={data}
                pagination={{
                    current: page,
                    pageSize,
                    onChange: (p, ps) => {
                        setPage(p);
                        setPagesize(ps);
                    },
                }}
                request={(params: any, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
                    return fetchData({
                        pageNumber: params.current ?? 1,
                        pageSize: params.pageSize ?? 20,
                        email: params.email,
                        contactNumber: params.contactNumber,
                        departmentId: params?.departmentId,
                        positionId: params?.positionId,
                        status: statusFilter,
                    });
                }}
                search={{
                    labelWidth: 'auto',
                }}
                rowSelection={
                    statusFilter === UserStatus.Pending
                        ? {
                            onChange: (_, selectedRows) => setSelectedRows(selectedRows),
                        }
                        : undefined
                }
            />

            {/* Batch approve toolbar */}
            {statusFilter === UserStatus.Pending && selectedRows.length > 0 && (
                <FooterToolbar
                    extra={
                        <div>
                            Chosen <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> item
                        </div>
                    }
                >
                    <Button
                        onClick={async () => handleStatusUpdate(selectedRows, UserStatus.Approved)}
                    >
                        Batch Approve
                    </Button>
                </FooterToolbar>
            )}
        </>
    );
};

export default UserApproval;
