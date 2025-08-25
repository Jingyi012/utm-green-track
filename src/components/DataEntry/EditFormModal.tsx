'use client';

import { Modal, Button, Upload, App } from "antd";
import {
    ProForm,
    ProFormSelect,
    ProFormText,
    ProFormDigit,
} from "@ant-design/pro-components";
import { UploadOutlined } from "@ant-design/icons";
import { WasteTypeWithEmissionFactor } from "@/lib/types/typing";
import { useState, useEffect } from "react";

type Props = {
    open: boolean;
    record: any | null;
    campuses: { id: string; name: string }[];
    disposalMethods: {
        id: string;
        name: string;
        wasteTypes: WasteTypeWithEmissionFactor[];
    }[];
    onClose: () => void;
    onSave: (values: any, recordKey: string) => void;
};

export default function EditformModal({
    open,
    record,
    campuses,
    disposalMethods,
    onClose,
    onSave,
}: Props) {
    const { message } = App.useApp();
    const [form] = ProForm.useForm();
    const [selectedDisposalMethod, setSelectedDisposalMethod] = useState<string>();
    const [wasteTypes, setWasteTypes] = useState<WasteTypeWithEmissionFactor[]>([]);

    useEffect(() => {
        if (record) {
            form.setFieldsValue(record);
            const method = disposalMethods.find((dm) => dm.id === record.disposalMethod);
            setWasteTypes(method?.wasteTypes ?? []);
            setSelectedDisposalMethod(record.disposalMethod);
        }
    }, [record, disposalMethods, form]);

    const handleDisposalMethodChange = (value: string) => {
        setSelectedDisposalMethod(value);
        const selectedMethod = disposalMethods.find((dm) => dm.id === value);
        form.resetFields(["wasteType"]);
        setWasteTypes(selectedMethod?.wasteTypes ?? []);
    };

    const handleFinish = async (values: any) => {
        if (!record) return;
        onSave(values, record.key);
        onClose();
    };

    return (
        <Modal
            title="Edit Waste Record"
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
            destroyOnHidden
        >
            <ProForm
                form={form}
                layout="vertical"
                submitter={false}
                onFinish={handleFinish}
            >
                <ProFormSelect
                    name="campus"
                    label="UTM Campus"
                    placeholder="Please select campus"
                    rules={[{ required: true, message: "Please select a campus" }]}
                    options={campuses.map((campus) => ({
                        label: campus.name,
                        value: campus.name,
                    }))}
                    fieldProps={{
                        showSearch: true,
                    }}
                />

                <ProFormText name="location" label="Location" placeholder="Please enter location" />

                <ProFormSelect
                    name="disposalMethod"
                    label="Disposal Method"
                    placeholder="Please select disposal method"
                    rules={[{ required: true, message: "Please select disposal method" }]}
                    options={disposalMethods.map((method) => ({
                        label: method.name,
                        value: method.id,
                    }))}
                    fieldProps={{
                        onChange: handleDisposalMethodChange,
                        showSearch: true,
                    }}
                />

                <ProFormSelect
                    name="wasteType"
                    label="Waste Type"
                    placeholder="Please select waste type"
                    rules={[{ required: true, message: "Please select waste type" }]}
                    options={wasteTypes.map((wt) => ({
                        label: wt.name,
                        value: wt.id,
                    }))}
                    fieldProps={{
                        disabled: !selectedDisposalMethod,
                        showSearch: true,
                    }}
                />

                <ProFormDigit
                    name="wasteWeight"
                    label="Waste Weight (kg)"
                    placeholder="Please enter waste weight"
                    rules={[{ required: true, message: "Please enter waste weight" }]}
                    fieldProps={{
                        min: 0,
                        step: 0.1,
                        precision: 2,
                    }}
                />

                <ProForm.Item
                    name="file"
                    label="Attachment"
                    rules={[{ required: false }]}
                    valuePropName="fileList"
                    getValueFromEvent={(e: { fileList: any; }) => {
                        if (Array.isArray(e)) {
                            return e;
                        }
                        return e?.fileList;
                    }}
                >
                    <Upload
                        beforeUpload={(file) => {
                            const isLt5M = file.size / 1024 / 1024 < 5;
                            if (!isLt5M) {
                                message.error('File must be smaller than 5MB!');
                                return Upload.LIST_IGNORE;
                            }
                            return false;
                        }}
                        multiple
                        maxCount={5}
                    >
                        <Button icon={<UploadOutlined />}>Click to upload files</Button>
                    </Upload>
                </ProForm.Item>

                <div className="flex justify-center gap-4 mt-6">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" onClick={() => form.submit()}>
                        Save Changes
                    </Button>
                </div>
            </ProForm>
        </Modal>
    );
}
