'use client';

import { useProfileDropdownOptions } from "@/hook/options";
import { deleteUser, exportExcelUsers, exportPdfUsers, getAllUsers, updateUser } from "@/lib/services/user";
import { UserDetails } from "@/lib/types/typing";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Button, Modal, Popconfirm, Tag } from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useState, useRef } from "react";
import UserDetailsDrawerForm, { FormValueType } from "./UserDetailsDrawerForm";
import { DeleteOutlined, EditOutlined, FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import { getBaseUserColumns } from "./columns";
import { downloadFile } from "@/lib/utils/downloadFile";

const UserManagement: React.FC = () => {
    const { message } = App.useApp();
    const { positions, departments, roles, isLoading } = useProfileDropdownOptions();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<UserDetails>();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [excelLoading, setExcelLoading] = useState<boolean>(false);
    const [pdfLoading, setPdfLoading] = useState<boolean>(false);

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
                roleIds: user.roleIds,
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

    const handleDeleteUser = async (userId: string) => {
        try {
            setLoading(true);
            const res = await deleteUser(userId);
            if (res.success) {
                message.success("User deleted successfully");
                return true;
            }
            else {
                message.error(res.message || "Failed to delete user");
                return false;
            }
        } catch (err) {
            message.error(err?.response?.data?.message || "Failed to delete user");
            return false;
        }
    }

    const columns: ProColumns<UserDetails>[] = [
        ...getBaseUserColumns({ positions, departments, roles }),
        {
            title: "Action",
            align: "center",
            hideInSearch: true,
            render: (_, record) => {
                return <>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedUser(record);
                            setModalOpen(true);
                            setEditMode(true);
                        }}
                        loading={loading}
                    />
                    <Popconfirm
                        title="Delete this user?"
                        onConfirm={async () => {
                            await handleDeleteUser(record.id);
                            if (actionRef.current) {
                                actionRef.current.reload();
                            }
                        }}
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </>
            }
        },
    ];

    const handleExportExcel = async () => {

        const hide = message.loading("Generating Excel...");
        try {
            setExcelLoading(true);
            const response = await exportExcelUsers();
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, "User_Records.xlsx");
        } catch (err: any) {
            message.error('Failed to generate Excel');
        } finally {
            setExcelLoading(false);
            hide();
        }
    };

    const handleExportPDF = async () => {
        const hide = message.loading("Generating Pdf...");
        try {
            setPdfLoading(true);
            const response = await exportPdfUsers();
            const contentDisposition = response.headers['content-disposition'];
            downloadFile(response.data, contentDisposition, "User_Records.pdf");
        } catch (err: any) {
            message.error('Failed to generate PDF');
        } finally {
            setPdfLoading(false);
            hide();
        }
    };

    return (
        <>
            <ProTable<UserDetails>
                rowKey="id"
                headerTitle="User List"
                actionRef={actionRef}
                loading={loading || isLoading}
                columns={columns}
                pagination={{
                }}
                request={(params: any, sort: Record<string, SortOrder>, filter: Record<string, (string | number)[] | null>) => {
                    return fetchData({
                        ...params,
                        pageNumber: params.current ?? 1,
                        pageSize: params.pageSize ?? 20,
                    });
                }}
                toolbar={{
                    actions: [
                        <Button
                            key="excel"
                            loading={excelLoading}
                            icon={<FileExcelOutlined />}
                            onClick={() => {
                                Modal.confirm({
                                    title: "Export to Excel",
                                    content: "Are you sure you want to export all user as Excel?",
                                    okText: "Yes, Export",
                                    cancelText: "Cancel",
                                    onOk: handleExportExcel,
                                });
                            }}
                        >
                            Excel
                        </Button>,

                        <Button
                            key="pdf"
                            loading={pdfLoading}
                            icon={<FilePdfOutlined />}
                            danger
                            onClick={() => {
                                Modal.confirm({
                                    title: "Export to PDF",
                                    content: "Are you sure you want to export all user as PDF?",
                                    okText: "Yes, Export",
                                    cancelText: "Cancel",
                                    onOk: handleExportPDF,
                                });
                            }}
                        >
                            PDF
                        </Button>,
                    ],
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
