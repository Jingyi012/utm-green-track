'use client'
import { useState } from "react";
import { Modal, Form, Select } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

interface ExportModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (year: number, month: number) => void;
  type: "excel" | "pdf";
}

export const ExportModal = ({ open, onCancel, onConfirm, type }: ExportModalProps) => {
  const [form] = Form.useForm();
  const currentYear = dayjs().year();

  const handleOk = async () => {
    try {
      const { year, month } = await form.validateFields();
      onConfirm(year, month);
      onCancel();
    } catch {
      // validation failed, do nothing
    }
  };

  return (
    <Modal
      title={`Select Year & Month for ${type.toUpperCase()} Export`}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical" initialValues={{ year: currentYear, month: 0 }}>
        <Form.Item label="Year" name="year" rules={[{ required: true }]}>
          <Select>
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <Option key={y} value={y}>
                {y}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Month" name="month" rules={[{ required: true }]}>
          <Select>
            <Option value={0}>All Months</Option>
            {Array.from({ length: 12 }, (_, i) => (
              <Option key={i + 1} value={i + 1}>
                {dayjs().month(i).format("MMMM")}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
