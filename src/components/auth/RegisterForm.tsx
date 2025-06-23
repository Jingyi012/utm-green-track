'use client';

import { registerUser } from '@/lib/api/auth';
import { Form, Input, Button, Row, Col, Select, Typography, message, Modal } from 'antd';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;

export default function RegistrationForm() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const router = useRouter();

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
        router.push('/auth/login');
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 shadow rounded">
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
                            <Select placeholder="Select your department">
                                <Option value="Malaysia-Japan Advanced Research Centre">Malaysia-Japan Advanced Research Centre</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Contact Number"
                            name="contactNo"
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
                            <Select placeholder="Select your position">
                                <Option value="UTM Staff">UTM Staff</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please enter a password' }]}
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
                            <Select placeholder="Select your role">
                                <Option value="Academic Staff">Academic Staff</Option>
                                <Option value="Non-Academic Staff">Non-Academic Staff</Option>
                            </Select>
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
                                <a href="/auth/login" className="text-primary underline">Already have an account? Sign in</a>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item>

                </Form.Item>
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
