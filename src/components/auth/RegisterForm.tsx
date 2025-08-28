'use client';

import { registerUser } from '@/lib/services/auth';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { App, Button, Col, Modal, Row, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileDropdownOptions } from '@/hook/options';

const { Title } = Typography;

export default function RegistrationForm() {
    const { message } = App.useApp();
    const { positions, departments, roles } = useProfileDropdownOptions();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<string>();
    const router = useRouter();

    const [form] = ProForm.useForm();

    const handlePositionChange = (value: string) => {
        setSelectedPosition(value);
        // Clear roles when position changes
        form.setFieldValue('role', undefined);
    };

    const roleOptions = useMemo(() => {
        if (!selectedPosition) return [];
        const position = positions.find(p => p.id === selectedPosition);
        if (!position) return [];
        return roles
            .filter(r => r.category === position.name)
            .map(r => ({
                label: r.name,
                value: r.name,
            }));
    }, [positions, roles, selectedPosition]);

    const handleRegister = async (values: any) => {
        try {
            setLoading(true);
            const res = await registerUser({
                ...values,
                roles: [values.role]
            });
            if (res.success) {
                form.resetFields();
                setIsModalVisible(true);
            } else {
                message.error(res.message);
            }
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigateToLogin = () => {
        setIsModalVisible(false);
        router.push('/login');
    };

    return (
        <div className="mx-auto bg-white p-8 shadow rounded-xl bg-white/95 backdrop-blur-sm border border-green-100">
            <Title level={3} className="text-center mb-6 text-primary">
                Create New Account
            </Title>

            <ProForm
                form={form}
                layout="vertical"
                onFinish={handleRegister}
                submitter={{
                    render: (_, dom) => (
                        <div className="flex flex-col w-full">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="w-full"
                            >
                                Sign Up
                            </Button>
                            <div className="text-right my-1 text-xs text-gray-600">
                                By clicking Sign Up, you agree to our Terms and Privacy Policy.
                            </div>
                            <div className="text-right my-1">
                                <a href="/login" className="text-primary underline">
                                    Already have an account? Sign in
                                </a>
                            </div>
                        </div>
                    ),
                }}
            >
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <ProFormText
                            name="name"
                            label="Full Name"
                            placeholder="e.g. John Doe"
                            rules={[{ required: true, message: 'Please enter your name' }]}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <ProFormText
                            name="email"
                            label="UTM Email"
                            placeholder="e.g. john@graduate.utm.my"
                            rules={[
                                { required: true, message: 'Please enter your email' },
                                { type: 'email', message: 'Invalid email format' },
                                {
                                    pattern: /^[a-zA-Z0-9._%+-]+@(utm\.my|graduate\.utm\.my)$/,
                                    message: 'Email must be @utm.my or @graduate.utm.my'
                                },
                            ]}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <ProFormSelect
                            name="departmentId"
                            label="Faculty / Department / College"
                            placeholder="Select your department"
                            options={departments.map((dept) => ({
                                label: dept.name,
                                value: dept.id,
                            }))}
                            rules={[{ required: true, message: 'Please select your faculty / department' }]}
                            showSearch
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <ProFormText
                            name="contactNumber"
                            label="Contact Number"
                            placeholder="e.g. +60123456789"
                            rules={[{ required: true, message: 'Please enter your contact number' }]}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <ProFormSelect
                            name="positionId"
                            label="Position"
                            placeholder="Select your position"
                            options={positions.map((position) => ({
                                label: position.name,
                                value: position.id,
                            }))}
                            rules={[{ required: true, message: 'Please select a position' }]}
                            onChange={handlePositionChange}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <ProFormSelect
                            name="role"
                            label="Role"
                            placeholder="Select your role"
                            options={roleOptions}
                            rules={[{ required: true, message: 'Please select a role' }]}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <ProFormText.Password
                            name="password"
                            label="Password"
                            placeholder="Enter your password"
                            rules={[
                                { required: true, message: 'Please enter a password' },
                                { min: 8, message: 'Password must be at least 8 characters' },
                            ]}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <ProFormText.Password
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            rules={[
                                { required: true, message: 'Please confirm your password' },
                                ({ getFieldValue }) => ({
                                    validator(_: any, value: any) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords don't match"));
                                    },
                                }),
                            ]}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <ProFormText
                            name="staffMatricNo"
                            label="Staff / Matric No."
                            placeholder="e.g. A21MJ1234 / MJIIT7890"
                            rules={[{ required: true, message: 'Please enter staff / matric No.' }]}
                        />
                    </Col>
                </Row>
            </ProForm>

            <Modal
                title="Registration Successful"
                open={isModalVisible}
                onOk={handleNavigateToLogin}
                onCancel={() => setIsModalVisible(false)}
                okText="Go to Login"
                cancelText="Stay Here"
            >
                <p>Your registration request has been submitted successfully.</p>
                <p>You will receive an email notification once it has been approved by the admin.</p>
            </Modal>
        </div>
    );
}
