'use client';

import { useProfileDropdownOptions } from '@/hook/options';
import { getProfile, updateProfile } from '@/lib/services/user';
import { UserDetails } from '@/lib/types/typing';
import { EditOutlined } from '@ant-design/icons';

import {
    ProForm,
    ProFormText,
    ProFormSelect,
    ProCard,
    ProDescriptions,
    PageContainer
} from '@ant-design/pro-components';

import { App, Button, Col, Row } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const EditProfileForm = () => {
    const { message } = App.useApp();
    const { positions, departments, roles } = useProfileDropdownOptions();

    const [userData, setUserData] = useState<UserDetails>();
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Role options filter
    const roleOptions = useMemo(() => {
        if (!userData?.positionId) return [];
        const position = positions.find(p => p.id === userData.positionId);
        if (!position) return [];

        return roles
            .filter(r => r.category === position.name)
            .map(r => ({ label: r.name, value: r.id }));
    }, [positions, roles, userData?.positionId]);

    // Fetch profile
    useEffect(() => {
        const fetchData = async () => {
            try {
                const profile = await getProfile();
                setUserData(profile.data);
            } catch (err: any) {
                message.error(err?.response?.data?.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Submit handler
    const handleSubmit = async (values: any) => {
        try {
            setSubmitting(true);
            const payload = {
                userId: userData?.id,
                name: values.name,
                contactNumber: values.contactNumber,
                staffMatricNo: values.staffMatricNo,
                departmentId: values.departmentId,
                positionId: values.positionId,
                roleIds: values.roleIds ? [values.roleIds] : [],
            };

            const res = await updateProfile(payload);
            if (res.success) {
                message.success('Profile updated successfully');
                setUserData({ ...userData!, ...values });
                setEditMode(false);
            } else {
                message.error(res.message || 'Profile update failed');
            }
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Profile update failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageContainer title={false}>
            <ProCard
                title="Account Information"
                headerBordered
                loading={loading}
                extra={
                    !editMode && (
                        <Button type="primary" onClick={() => setEditMode(true)}>
                            <EditOutlined />Edit Profile
                        </Button>
                    )
                }
            >
                {/* VIEW MODE */}
                {!editMode && userData && (
                    <ProDescriptions
                        column={2}
                        bordered
                        size="default"
                        dataSource={{
                            ...userData,
                            role: userData.roleIds?.[0] || '-',
                        }}
                    >
                        <ProDescriptions.Item label="Full Name">{userData.name}</ProDescriptions.Item>
                        <ProDescriptions.Item label="UTM Email">{userData.email}</ProDescriptions.Item>
                        <ProDescriptions.Item label="Staff / Matric No.">
                            {userData.staffMatricNo}
                        </ProDescriptions.Item>
                        <ProDescriptions.Item label="Contact Number">
                            {userData.contactNumber}
                        </ProDescriptions.Item>
                        <ProDescriptions.Item label="Department">
                            {
                                departments.find(d => d.id === userData.departmentId)?.name ??
                                userData.departmentId
                            }
                        </ProDescriptions.Item>
                        <ProDescriptions.Item label="PTJ / Unit">
                            {userData.unit ?? '-'}
                        </ProDescriptions.Item>
                        <ProDescriptions.Item label="Position">
                            {positions.find(p => p.id === userData.positionId)?.name}
                        </ProDescriptions.Item>
                        <ProDescriptions.Item label="Role">
                            {roles.find(r => r.id === userData.roleIds[0])?.name}
                        </ProDescriptions.Item>
                    </ProDescriptions>
                )}

                {/* EDIT MODE */}
                {editMode && userData && (
                    <ProForm
                        layout="vertical"
                        initialValues={{
                            ...userData,
                            role: userData.roleIds[0],
                        }}
                        onFinish={handleSubmit}
                        submitter={{
                            render: () => (
                                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
                                    <Button onClick={() => setEditMode(false)} disabled={submitting}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={submitting}>
                                        Save Changes
                                    </Button>
                                </div>
                            ),
                        }}
                    >
                        <Row gutter={16}>
                            <Col md={12}>
                                <ProFormText
                                    name="name"
                                    label="Full Name"
                                    rules={[{ required: true }]}
                                />
                            </Col>

                            <Col md={12}>
                                <ProFormText name="email" label="UTM Email" disabled />
                            </Col>

                            <Col md={12}>
                                <ProFormText
                                    name="staffMatricNo"
                                    label="Staff / Matric No."
                                    rules={[{ required: true }]}
                                />
                            </Col>

                            <Col md={12}>
                                <ProFormText
                                    name="contactNumber"
                                    label="Contact Number"
                                    rules={[{ required: true }]}
                                />
                            </Col>

                            <Col md={12}>
                                <ProFormSelect
                                    name="departmentId"
                                    label="Department"
                                    options={departments.map(r => ({ label: r.name, value: r.id }))}
                                    rules={[{ required: true }]}
                                    fieldProps={{
                                        showSearch: true,
                                        optionFilterProp: "label",
                                    }}
                                />
                            </Col>

                            <Col md={12}>
                                <ProFormText name="unit" label="PTJ / Unit" />
                            </Col>

                            <Col md={12}>
                                <ProFormSelect
                                    name="positionId"
                                    label="Position"
                                    options={positions.map(p => ({ label: p.name, value: p.id }))}
                                    disabled
                                />
                            </Col>

                            <Col md={12}>
                                <ProFormSelect
                                    name="roleIds"
                                    label="Role"
                                    options={roleOptions}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </ProForm>
                )}
            </ProCard>
        </PageContainer>
    );
};

export default EditProfileForm;
