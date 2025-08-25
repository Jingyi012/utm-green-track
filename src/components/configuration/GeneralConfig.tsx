'use client'
import { getAllConfig, updateConfig } from "@/lib/services/config";
import { Config } from "@/lib/types/typing";
import { EditOutlined } from "@ant-design/icons";
import { ActionType, ModalForm, ProColumns, ProFormText, ProTable } from "@ant-design/pro-components";
import { App, Button } from "antd";
import { useRef, useState } from "react";

export const GeneralConfig: React.FC = () => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState<boolean>(false);
    const [configData, setConfigData] = useState<Config[]>([]);
    const [selectedConfig, setSelectedConfig] = useState<Config>();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const actionRef = useRef<ActionType | undefined>(undefined);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getAllConfig();

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

    const handleEditConfig = async (key: string, value: string) => {
        try {
            setLoading(true);
            const res = await updateConfig({
                key,
                value
            });
            if (res.success) {
                message.success("Config updated successfully");
                return true;
            } else {
                message.error(res.message || "Failed to update config");
                return false;
            }

        } catch (err) {
            message.error("Failed to update config");
            return false;
        } finally {
            setLoading(false);
        }
    }

    const columns: ProColumns[] = [
        {
            title: 'Key',
            dataIndex: 'key',
            width: 500
        },
        {
            title: 'Value',
            dataIndex: 'value'
        },
        {
            title: 'Action',
            valueType: 'option',
            render: (_: any, record: Config) => {
                return (
                    <>
                        <Button onClick={() => {
                            setSelectedConfig(record);
                            setModalOpen(true);
                        }}>
                            <EditOutlined />
                        </Button>
                    </>
                )
            }
        }
    ]


    return (<>
        <ProTable<Config>
            headerTitle={'General Config'}
            loading={loading}
            actionRef={actionRef}
            dataSource={configData}
            columns={columns}
            search={false}
            request={fetchData}
        />
        <ModalForm
            title="Edit General Config"
            open={modalOpen}
            initialValues={selectedConfig || {}}
            modalProps={{
                destroyOnClose: true,
                onCancel: () => {
                    setSelectedConfig(undefined);
                    setModalOpen(false)
                },
            }}
            onOpenChange={(open) => {
                if (!open) {
                    setSelectedConfig(undefined);
                    setModalOpen(false)
                }
            }}
            onFinish={async (values) => {
                const success = await handleEditConfig(values.key, values.value);
                if (success) {
                    if (actionRef.current) {
                        actionRef.current.reload();
                    }
                    return true;
                }
                return false;
            }}
        >
            <ProFormText
                label='Key'
                name='key'
                rules={[{ required: true }]}
                disabled
            />
            <ProFormText
                label='Value'
                name='value'
                rules={[{ required: true }]}
                placeholder={'Please enter value'}
            />
        </ModalForm>
    </>);
}