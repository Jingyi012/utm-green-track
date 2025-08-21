'use client';

import { useProfileDropdownOptions } from "@/hook/options";
import { UserStatus, userStatusLabels } from "@/lib/enum/status";
import { getAllUsers, updateUser } from "@/lib/services/user";
import { UserDetails } from "@/lib/types/typing";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, Tag, message } from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useState, useRef } from "react";
import UserDetailsDrawerForm, { FormValueType } from "./UserDetailsDrawerForm";

const UserManagement: React.FC = () => {
    const { positions, departments, roles, isLoading } = useProfileDropdownOptions();
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPagesize] = useState<number>(20);
    const [data, setData] = useState<UserDetails[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserDetails>();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);

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

    const handleUserUpdate = async (user: UserDetails) => {
        try {
            setLoading(true);

            const res = await updateUser({
                userId: user.id,
                name: user.name,
                email: user.email,
                contactNumber: user.contactNumber,
                staffMatricNo: user.staffMatricNo,
                departmentId: user.departmentId,
                positionId: user.positionId,
                roleIds: user.roles,
                status: user.status
            });

            if (res.success) {
                message.success("User updated successfully");
                return true;
            }
            else {
                message.error(res.message || "Failed to update user");
                return false;
            }
        } catch (err) {
            message.error("Failed to update user");
            return false;
        } finally {
            setLoading(false);
        }
    }

    const columns: ProColumns<UserDetails>[] = [
        {
            title: "No.",
            render: (_: any, __: any, index: number) =>
                (page - 1) * pageSize + index + 1,
            width: 60,
            align: "center",
            hideInSearch: true,
        },
        {
            title: 'Name',
            dataIndex: 'name', align: "center",
            render: (dom, entity) => {
                return (
                    <a
                        onClick={() => {
                            setSelectedUser(entity);
                            setModalOpen(true);
                            setEditMode(false);
                        }}
                    >
                        {dom}
                    </a>
                );
            },
        },
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
        }
        ,
        {
            title: "Status",
            dataIndex: "status",
            align: "center",
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
                return <>
                    <Button
                        type="link"
                        onClick={() => {
                            setSelectedUser(record);
                            setModalOpen(true);
                            setEditMode(true);
                        }}
                        loading={loading}
                    >
                        Edit
                    </Button>
                </>
            }
        },
    ];

    return (
        <>
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
                        departmentId: params?.department,
                        positionId: params?.position,
                        status: params?.status,
                    });
                }}
                search={{
                    labelWidth: 'auto',
                }}
            />

            <UserDetailsDrawerForm
                departments={departments}
                positions={positions}
                roles={roles}
                onCancel={() => {
                    setModalOpen(false);
                    setEditMode(false);
                    setTimeout(() => setSelectedUser(undefined), 300);
                }
                }
                onSubmit={async (value) => {
                    const success = await handleUserUpdate(value as UserDetails);
                    if (success) {
                        if (actionRef.current) {
                            actionRef.current.reload();
                        }
                        return true;
                    }
                    return false;
                }}
                visible={modalOpen}
                initialValues={selectedUser || {}}
                isEditMode={editMode}
            />
        </>
    );
};

export default UserManagement;
