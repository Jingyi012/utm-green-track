'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Input, Button, Typography, App } from 'antd';
import { resetPassword } from '@/lib/services/auth';
import { Card } from 'antd/lib';

const { Title, Text } = Typography;

export default function ResetPasswordForm() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    useEffect(() => {
        if (tokenParam === null || emailParam === null) return;

        if (tokenParam && emailParam) {
            setToken(tokenParam);
            setEmail(emailParam);
        } else {
            message.error('Invalid or missing reset token and email.');
            router.replace('/login');
        }
    }, [tokenParam, emailParam]);

    const onFinish = async (values: any) => {
        if (!token || !email) {
            message.error('Missing reset token or email.');
            return;
        }
        if (values.newPassword !== values.confirmPassword) {
            message.error('Passwords do not match');
            return;
        }

        setSubmitting(true);
        try {
            const res = await resetPassword({
                email,
                token,
                password: values.newPassword
            });
            if (res.success) {
                message.success('Password reset successful');
                router.push('/login');
            } else {
                message.error(res.message || 'Password reset failed');
            }
        } catch (error: any) {
            message.error(error.message || 'Password reset failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto bg-white p-8 shadow rounded">
            <Title level={3} className="text-center text-primary">Reset Password</Title>
            <Text className="block text-center mb-4">Enter your new password below.</Text>

            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                        { required: true, message: 'Please enter new password' },
                        { min: 8, message: 'Password must be at least 8 characters' },
                    ]}
                    hasFeedback
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Please enter confirm password' },
                        { min: 8, message: 'Password must be at least 8 characters' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                return !value || getFieldValue('newPassword') === value
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('Passwords do not match'));
                            },
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={submitting}>
                        Reset Password
                    </Button>
                </Form.Item>

                <div className="flex justify-center text-xs gap-4">
                    <a href="/login" className="text-primary underline">Return to Login</a>
                </div>
            </Form>
        </Card>
    );
}
