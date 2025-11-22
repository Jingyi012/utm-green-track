'use client';

import { useProfileDropdownOptions } from "@/hook/options";
import { UserStatus, userStatusLabels } from "@/lib/enum/status";
import { getAllUsers, updateUserApprovalStatus } from "@/lib/services/user";
import { UserDetails } from "@/lib/types/typing";
import { ActionType, FooterToolbar, ModalForm, ProColumns, ProFormTextArea, ProTable } from "@ant-design/pro-components";
import { App, Button, Tabs } from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useState, useEffect, useRef } from "react";
import { getBaseUserColumns } from "./columns";

const UserApproval: React.FC = () => {
    const { message } = App.useApp();
    const { positions, departments, roles, isLoading } = useProfileDropdownOptions();
    const [loading, setLoading] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<UserStatus>(UserStatus.Pending);
    const [selectedRows, setSelectedRows] = useState<UserDetails[]>([]);
    const actionRef = useRef<ActionType | undefined>(undefined);

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectingUsers, setRejectingUsers] = useState<UserDetails[]>([]);

    const openRejectModal = (users: UserDetails[]) => {
        setRejectingUsers(users);
        setRejectModalOpen(true);
    };

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
            return {
                data: res.data,
                success: res.success,
                total: res.totalCount
            }
        } catch (err) {
            message.error("Failed to fetch users");
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
    const handleStatusUpdate = async (
        users: UserDetails[],
        status: UserStatus,
        rejectedReason?: string
    ) => {
        if (!users.length) return;
        try {
            const userIds = users.map(u => u.id);
            const res = await updateUserApprovalStatus({ userIds, status, rejectedReason });
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
        ...getBaseUserColumns({ positions, departments, roles }),
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
                            >
                                Approve
                            </Button>

                            <Button
                                type="link"
                                danger
                                onClick={() => openRejectModal([record])}
                            >
                                Reject
                            </Button>
                        </>
                    );
                }

                if (record.status === UserStatus.Approved) {
                    return (
                        <Button
                            type="link"
                            danger
                            onClick={() => openRejectModal([record])}
                        >
                            Reject
                        </Button>
                    );
                }

                if (record.status === UserStatus.Rejected) {
                    return (
                        <Button
                            type="link"
                            onClick={() => handleStatusUpdate([record], UserStatus.Approved)}
                        >
                            Approve
                        </Button>
                    );
                }

                return "-";
            }
        }

    ];

    useEffect(() => {
        actionRef.current?.reloadAndRest?.();
    }, [statusFilter])

    return (
        <>
            <Tabs
                activeKey={statusFilter.toString()}
                onChange={(key) => {
                    setStatusFilter(parseInt(key) as UserStatus);
                    setSelectedRows([]);
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
                pagination={{
                    showSizeChanger: true
                }}
                request={(params: any, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
                    return fetchData({
                        ...params,
                        pageNumber: params.current ?? 1,
                        pageSize: params.pageSize ?? 20,
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

            <ModalForm
                title="Reject User"
                open={rejectModalOpen}
                modalProps={{
                    destroyOnClose: true,
                    onCancel: () => setRejectModalOpen(false),
                }}
                onOpenChange={setRejectModalOpen}
                onFinish={async (values) => {
                    await handleStatusUpdate(rejectingUsers, UserStatus.Rejected, values.rejectedReason);
                    return true;
                }}
                submitter={{
                    searchConfig: {
                        submitText: "Submit",
                        resetText: "Cancel"
                    }
                }}
            >
                <ProFormTextArea
                    name="rejectedReason"
                    label="Reject Reason"
                    placeholder="Enter reason for rejection"
                    rules={[{ required: true, message: "Reject reason is required" }]}
                    fieldProps={{ rows: 4 }}
                />
            </ModalForm>

        </>
    );
};

export default UserApproval;
