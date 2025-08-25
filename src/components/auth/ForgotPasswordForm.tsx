'use client';

import { forgotPassword } from '@/lib/services/auth';
import { Form, Input, Button, Typography, App } from 'antd';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function ForgotPasswordForm() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleFinish = async (values: any) => {
        setLoading(true);
        try {
            await forgotPassword(values.email);
            message.success(`Password reset link sent to ${values.email}`);
            form.resetFields();
        } catch (error: any) {
            message.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 shadow rounded">
            <Title level={3} className="text-center text-primary">Reset Password</Title>
            <Text className="block text-center mb-4">Enter your registered email to receive a reset link.</Text>

            <Form
                layout="vertical"
                form={form}
                onFinish={handleFinish}
            >
                <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                        { required: true, message: 'Please enter your email address' },
                        { type: 'email', message: 'Please enter a valid email address' },
                        {
                            pattern: /^[a-zA-Z0-9._%+-]+@(utm\.my|graduate\.utm\.my)$/,
                            message: 'Email must be @utm.my or @graduate.utm.my'
                        },
                    ]}
                >
                    <Input placeholder="e.g. user@utm.my" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Send Reset Link
                    </Button>
                </Form.Item>

                <div className="flex gap-8 text-xs justify-between">
                    <a href="/login" className="text-primary underline">Already have an account? Sign In</a>
                    <a href="/signup" className="text-primary underline">Don't have an account? Sign Up
                    </a>
                </div>
            </Form>
        </div>
    );
}
