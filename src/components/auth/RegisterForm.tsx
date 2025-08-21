'use client';

import { registerUser } from '@/lib/services/auth';
import { Form, Input, Button, Row, Col, Select, Typography, message, Modal } from 'antd';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileDropdownOptions } from '@/hook/options';

const { Title } = Typography;

export default function RegistrationForm() {
    const { positions, departments, roles } = useProfileDropdownOptions();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const router = useRouter();

    const [roleOption, setRoleOption] = useState<Record<string, string>>({});

    const selectedPosition = Form.useWatch('position', form);

    // Dynamically compute role options
    const roleOptions = useMemo(() => {
        if (!selectedPosition) return [];

        const position = positions.find(p => p.id === selectedPosition);
        if (!position) return [];

        const matchedRoles = roles
            .filter(r => r.category === position.name)
            .map(r => ({
                label: r.name,
                value: r.id,
            }));

        return matchedRoles.length > 0
            ? matchedRoles
            : [{ label: 'No roles available', value: '', disabled: true }];
    }, [positions, roles, selectedPosition]);

    const handleRegister = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            await registerUser(values);
            form.resetFields();
            setIsModalVisible(true);
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
            <Title level={3} className="text-center mb-6 text-primary">Create New Account</Title>
            <Form layout="vertical" form={form} onFinish={handleRegister}>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter your name' }]}
                        >
                            <Input placeholder="e.g. John Doe" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="UTM Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Please enter your email' },
                                { type: 'email', message: 'Invalid email format' },
                            ]}
                        >
                            <Input placeholder="e.g. john@graduate.utm.my" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="department"
                            label="Faculty / Department / College"
                            rules={[{ required: true, message: 'Please select your faculty / department' }]}
                        >
                            <Select placeholder="Select your department"
                                options={departments.map((dept) => ({
                                    label: dept.name,
                                    value: dept.id
                                }))} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Contact Number"
                            name="contactNumber"
                            rules={[{ required: true, message: 'Please enter your contact number' }]}
                        >
                            <Input placeholder="e.g. +60123456789" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="position"
                            label="Position"
                            rules={[{ required: true, message: 'Please select a position' }]}
                        >
                            <Select placeholder="Select your position"
                                options={positions.map((position) => ({
                                    label: position.name,
                                    value: position.id
                                }))} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: 'Please enter a password' },
                                { min: 8, message: 'Password must be at least 8 characters' }
                            ]}
                            hasFeedback
                        >
                            <Input.Password placeholder="Enter your password" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Role"
                            name="role"
                            rules={[{ required: true, message: 'Please select a role' }]}
                        >
                            <Select<any>
                                placeholder="Select your role"
                                options={roleOptions}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Confirm Password"
                            name="confirmPassword"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm your password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords don't match"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Re-enter your password" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="staffMatricNo"
                            label="Staff / Matric No."
                            rules={[{ required: true, message: 'Please enter staff / matric No.' }]}
                        >
                            <Input placeholder="e.g. A21MJ1234 / MJIIT7890" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label={<span>&nbsp;</span>} >
                            <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                                Sign Up
                            </Button>
                            <div className="text-right my-1">
                                By clicking Sign Up, you agree to our Terms and Privacy Policy.
                            </div>
                            <div className="text-right my-1">
                                <a href="/login" className="text-primary underline">Already have an account? Sign in</a>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            <Modal
                title="Registration Successful"
                open={isModalVisible}
                onOk={handleNavigateToLogin}
                onCancel={() => setIsModalVisible(false)}
                okText="Go to Login"
                cancelText="Stay Here"
            >
                <p>Your account has been created successfully!</p>
                <p>Please click "Go to Login" to sign in.</p>
            </Modal>
        </div>
    );
}
