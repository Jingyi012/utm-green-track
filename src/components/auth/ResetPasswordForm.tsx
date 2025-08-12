'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Input, Button, Typography, message, Spin } from 'antd';
import { validateResetToken, resetPassword } from '@/lib/services/auth';
import { Card } from 'antd/lib';

const { Title, Text } = Typography;

export default function ResetPasswordForm() {
    const [form] = Form.useForm();
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setValidating(false);
            setTokenValid(false);
            return;
        }

        (async () => {
            try {
                const res = await validateResetToken(token);
                setTokenValid(res.success);
            } catch (err) {
                //message.error('Failed to validate token');
            } finally {
                setValidating(false);
            }
        })();
    }, [token]);

    const onFinish = async (values: any) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Passwords do not match');
            return;
        }

        setSubmitting(true);
        try {
            const res = await resetPassword(token!, values.newPassword);
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

    if (!validating && !tokenValid) {
        return (
            <div className="p-6 text-center">
                <Title level={4}>Invalid or Expired Link</Title>
                <Text>The reset password link is not valid. Please request a new one.</Text>
                <div className="mt-4">
                    <Button type="primary" onClick={() => { router.push('/forgot-password') }} block>
                        Request New Link
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto bg-white p-8 shadow rounded" loading={validating}>
            <Title level={3} className="text-center text-primary">Reset Password</Title>
            <Text className="block text-center mb-4">Enter your new password below.</Text>

            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                        { required: true, message: 'Please enter new password' },
                        { min: 8, message: 'Password must be at least 6 characters' },
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
                        { min: 8, message: 'Password must be at least 6 characters' },
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
