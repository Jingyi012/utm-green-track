'use client'
import { createDepartment, deleteDepartment, getAllDepartment, updateDepartment } from "@/lib/services/department";
import { Department } from "@/lib/types/typing";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ModalForm, ProColumns, ProFormText, ProTable } from "@ant-design/pro-components";
import { App, Button, Popconfirm } from "antd";
import { useRef, useState } from "react";

export const DepartmentConfig: React.FC = () => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState<boolean>(false);
    const [configData, setConfigData] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department>();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
    const actionRef = useRef<ActionType | undefined>(undefined);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getAllDepartment();

            if (res.success) {
                setConfigData(res.data);
                return {
                    data: res.data
                }
            } else {
                return {
                    data: []
                }
            }

        } catch (err) {
            message.error('Failed to fetch config data');
            return {
                data: []
            }
        } finally {
            setLoading(false);
        }
    }

    const handleCreateDepartment = async (name: string) => {
        try {
            setLoading(true);
            const res = await createDepartment({
                name
            });
            if (res.success) {
                message.success("Department added successfully");
                return true;
            } else {
                message.error(res.message || "Failed to add department");
                return false;
            }

        } catch (err) {
            message.error("Failed to add department");
            return false;
        } finally {
            setLoading(false);
        }
    }

    const handleEditDepartment = async (id: string, name: string) => {
        try {
            setLoading(true);
            const res = await updateDepartment(id, {
                id,
                name
            });
            if (res.success) {
                message.success("Department updated successfully");
                return true;
            } else {
                message.error(res.message || "Failed to update department");
                return false;
            }

        } catch (err) {
            message.error("Failed to update department");
            return false;
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteDepartment = async (id: string) => {
        try {
            setLoading(true);
            const res = await deleteDepartment(id);
            if (res.success) {
                message.success("Department deleted successfully");
                return true;
            } else {
                message.error(res.message || "Failed to delete department");
                return false;
            }

        } catch (err) {
            message.error("Failed to delete department");
            return false;
        } finally {
            setLoading(false);
        }
    }

    const columns: ProColumns[] = [
        {
            title: 'No.',
            dataIndex: 'index',
            render: (_: any, __: any, index: number, action) => {
                const current = action?.pageInfo?.current ?? 1;
                const pageSize = action?.pageInfo?.pageSize ?? 10;
                return (current - 1) * pageSize + index + 1;
            },
        },
        {
            title: 'Name',
            dataIndex: 'name'
        },
        {
            title: 'Action',
            valueType: 'option',
            render: (_: any, record: Department) => {
                return (
                    <>
                        <Button icon={<EditOutlined />}
                            style={{ marginRight: '20px' }}
                            onClick={() => {
                                setSelectedDepartment(record);
                                setModalOpen(true);
                            }} />
                        <Popconfirm
                            title="Delete this department?"
                            onConfirm={async () => {
                                await handleDeleteDepartment(record.id);
                                if (actionRef.current) {
                                    actionRef.current.reload();
                                }
                            }}
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </>
                )
            }
        }
    ]


    return (<>
        <ProTable<Department>
            headerTitle={'Departments'}
            key={"id"}
            loading={loading}
            actionRef={actionRef}
            dataSource={configData}
            columns={columns}
            search={false}
            request={fetchData}
            toolBarRender={() => [
                <Button
                    key="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setAddModalOpen(true);
                    }}>

                </Button>,
            ]}
        />
        <ModalForm
            title="Edit Department"
            open={modalOpen}
            initialValues={selectedDepartment || {}}
            modalProps={{
                destroyOnClose: true,
            }}
            onOpenChange={(open) => {
                if (!open) {
                    setSelectedDepartment(undefined);
                    setModalOpen(false)
                }
            }}
            onFinish={async (values) => {
                const success = await handleEditDepartment(values.id, values.name);
                if (success) {
                    if (actionRef.current) {
                        actionRef.current.reload();
                    }
                    return true;
                }
                return false;
            }}
            submitter={{
                searchConfig: {
                    submitText: 'Submit',
                },
            }}
        >
            <ProFormText
                label='Name'
                name='name'
                rules={[{ required: true }]}
            />
            <ProFormText
                label='Id'
                name='id'
                hidden
                rules={[{ required: true }]}
            />
        </ModalForm>

        <ModalForm
            title="Add Department"
            open={addModalOpen}
            modalProps={{
                destroyOnClose: true,
                onCancel: () => {
                    setAddModalOpen(false)
                },
            }}
            onOpenChange={(open) => {
                if (!open) {
                    setAddModalOpen(false)
                }
            }}
            onFinish={async (values) => {
                const success = await handleCreateDepartment(values.name);
                if (success) {
                    if (actionRef.current) {
                        actionRef.current.reload();
                    }
                    return true;
                }
                return false;
            }}
            submitter={{
                searchConfig: {
                    submitText: 'Submit',
                },
            }}
        >
            <ProFormText
                label='Name'
                name='name'
                rules={[{ required: true }]}
            />
        </ModalForm>
    </>);
}