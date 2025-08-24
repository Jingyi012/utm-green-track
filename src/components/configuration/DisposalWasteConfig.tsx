"use client";

import { useEffect, useState } from "react";
import {
    ProCard,
    ProTable,
    ModalForm,
    ProFormText,
    ProFormDigit,
} from "@ant-design/pro-components";
import { Button, Popconfirm, Space, message } from "antd";
import { DisposalMethodWithWasteType, WasteType } from "@/lib/types/typing";
import { createDisposalMethod, deleteDisposalMethod, getAllDisposalMethod, updateDisposalMethod } from "@/lib/services/disposalMethod";
import { createWasteType, deleteWasteType, updateWasteType } from "@/lib/services/wasteType";
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from "@ant-design/icons";

export default function DisposalWasteConfig() {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<DisposalMethodWithWasteType[]>([]);
    const [selectedDisposalMethod, setSelectedDisposalMethod] = useState<DisposalMethodWithWasteType | null>(
        null
    );
    const [editingWaste, setEditingWaste] = useState<WasteType | null>(null);
    const [editingMethod, setEditingMethod] = useState<DisposalMethodWithWasteType | null>(
        null
    );
    const [wasteTypeModalFormOpen, setWasteTypeModalFormOpen] = useState<boolean>(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getAllDisposalMethod();

            if (res.success) {
                setData(res.data);
            } else {
                setData([])
            }

        } catch (err) {
            message.error("Error fetch disposal methods and waste types");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateDisposalMethod = async (name: string) => {
        try {
            setLoading(true);
            const res = await createDisposalMethod({ name });
            if (res.success) {
                fetchData();
                message.success("Disposal Method added");
            } else {
                message.error("Failed to create disposal method")
            }
        } catch (err) {
            message.error("Failed to create disposal method")
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDisposalMethod = async (id: string, name: string) => {
        try {
            setLoading(true);
            const res = await updateDisposalMethod(id, { id, name });
            if (res.success) {
                fetchData();
                message.success("Disposal method updated successfully");
            } else {
                message.error("Failed to update disposal method")
            }
        } catch (err) {
            message.error("Failed to update disposal method")
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDisposalMethod = async (id: string) => {
        try {
            setLoading(true);
            const res = await deleteDisposalMethod(id);
            if (res.success) {
                fetchData();
                message.success("Disposal method deleted successfully");
            } else {
                message.error("Failed to delete disposal method")
            }
        } catch (err) {
            message.error("Failed to delete disposal method")
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWasteType = async (
        disposalMethodId: string,
        name: string,
        emissionFactor: number
    ) => {
        try {
            setLoading(true);
            const res = await createWasteType({ disposalMethodId, name, emissionFactor });
            if (res.success) {
                fetchData();
                message.success("Waste type added successfully");
            } else {
                message.error("Failed to add waste type")
            }
        } catch (err) {
            message.error("Failed to add waste type")
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateWasteType = async (
        id: string,
        name: string,
        emissionFactor: number
    ) => {
        try {
            setLoading(true);
            const res = await updateWasteType(id, { id, name, emissionFactor });
            if (res.success) {
                fetchData();
                message.success("Waste type updated successfully");
            } else {
                message.error("Failed to update waste type")
            }
        } catch (err) {
            message.error("Failed to update waste type")
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWasteType = async (id: string) => {
        try {
            setLoading(true);
            const res = await deleteWasteType(id);
            if (res.success) {
                fetchData();
                message.success("Waste type deleted successfully");
            } else {
                message.error("Failed to delete waste type")
            }
        } catch (err) {
            message.error("Failed to delete waste type")
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-4">
            {data.map((method) => (
                <ProCard
                    key={method.id}
                    title={method.name}
                    loading={loading}
                    bordered
                    extra={
                        <Space>
                            {/* <Button size="small" onClick={() => setEditingMethod(method)}>
                                <EditOutlined />
                            </Button> */}
                            <Popconfirm
                                title="Delete this disposal method?"
                                onConfirm={() => handleDeleteDisposalMethod(method.id)}
                            >
                                <Button danger size="small">
                                    <DeleteOutlined />
                                </Button>
                            </Popconfirm>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => {
                                    setSelectedDisposalMethod(method);
                                    setWasteTypeModalFormOpen(true);
                                }
                                }
                            >
                                <PlusCircleOutlined />
                            </Button>
                        </Space>
                    }
                >
                    <ProTable<WasteType>
                        rowKey="id"
                        dataSource={method.wasteTypes}
                        pagination={false}
                        search={false}
                        toolBarRender={false}
                        columns={[
                            { title: "Waste Type", dataIndex: "name", width: 350 },
                            { title: "Emission Factor (kg CO₂eq/ton)", dataIndex: "emissionFactor" },
                            {
                                title: "Actions",
                                valueType: "option",
                                render: (_, record) => [
                                    <Button
                                        key="edit"
                                        type="link"
                                        onClick={() => {
                                            setEditingWaste(record);
                                            setWasteTypeModalFormOpen(true);
                                        }}
                                    >
                                        <EditOutlined />
                                    </Button>,
                                    <Popconfirm
                                        key="delete"
                                        title="Delete this waste type?"
                                        onConfirm={() => handleDeleteWasteType(record.id)}
                                    >
                                        <Button type="link" danger>
                                            <DeleteOutlined />
                                        </Button>
                                    </Popconfirm>,
                                ],
                            },
                        ]}
                    />
                </ProCard>
            ))}

            {/* Add Disposal Method */}
            <ModalForm
                title="Add Disposal Method"
                trigger={<Button type="primary">+ Add Disposal Method</Button>}
                onFinish={async (values) => {
                    await handleCreateDisposalMethod(values.name);
                    return true;
                }}
            >
                <ProFormText
                    name="name"
                    label="Disposal Method Name"
                    rules={[{ required: true }]}
                />
            </ModalForm>

            {/* Edit Disposal Method */}
            <ModalForm
                title="Edit Disposal Method"
                open={!!editingMethod}
                initialValues={editingMethod || {}}
                onOpenChange={(open) => !open && setEditingMethod(null)}
                onFinish={async (values) => {
                    if (editingMethod) {
                        await handleUpdateDisposalMethod(editingMethod.id, values.name);
                    }
                    setEditingMethod(null);
                    return true;
                }}
            >
                <ProFormText
                    name="name"
                    label="Disposal Method Name"
                    rules={[{ required: true }]}
                />
            </ModalForm>

            {/* Add/Edit Waste Type */}
            <ModalForm
                title={editingWaste ? "Edit Waste Type" : "Add Waste Type"}
                open={wasteTypeModalFormOpen}
                initialValues={editingWaste || {}}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDisposalMethod(null);
                        setEditingWaste(null);
                        setWasteTypeModalFormOpen(false)
                    }
                }}
                onFinish={async (values) => {
                    if (editingWaste) {
                        // Editing existing waste type
                        await handleUpdateWasteType(
                            editingWaste.id,
                            values.name,
                            values.emissionFactor
                        );
                    } else if (selectedDisposalMethod) {
                        // Creating new waste type
                        await handleCreateWasteType(
                            selectedDisposalMethod.id,
                            values.name,
                            values.emissionFactor
                        );
                    }
                    setSelectedDisposalMethod(null);
                    setEditingWaste(null);
                    setWasteTypeModalFormOpen(false);
                    return true;
                }}
            >
                <ProFormText
                    name="name"
                    label="Waste Type Name"
                    rules={[{ required: true }]}
                />
                <ProFormDigit
                    name="emissionFactor"
                    label="Emission Factor"
                    rules={[{ required: true }]}
                />
            </ModalForm>

        </div>
    );
}
