'use client';

import { useProfileDropdownOptions } from '@/hook/options';
import { getProfile, updateProfile } from '@/lib/services/user';
import { UserDetails } from '@/lib/types/typing';
import {
    ProForm,
    ProFormText,
    ProFormSelect,
    ProCard,
} from '@ant-design/pro-components';
import { App, Button, Card, Col, Row, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const { Title } = Typography;

const EditProfileForm = () => {
    const { message } = App.useApp();
    const { positions, departments, roles } = useProfileDropdownOptions();
    const [userData, setUserData] = useState<UserDetails>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const roleOptions = useMemo(() => {
        if (!userData?.positionId) return [];
        const position = positions.find(p => p.id === userData.positionId);
        if (!position) return [];
        return roles
            .filter(r => r.category === position.name)
            .map(r => ({
                label: r.name,
                value: r.id,
            }));
    }, [positions, roles, userData?.positionId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profile = await getProfile();
                setUserData(profile.data);
            } catch (error: any) {
                message.error(error.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    });

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
                roleIds: values.role ? [values.role] : [],
            };

            const res = await updateProfile(payload);
            if (res.success) {
                message.success('Profile updated successfully');
                setUserData({ ...userData!, ...values }); // sync UI
                setEditMode(false);
            } else {
                message.error(res.message || 'Profile update failed');
            }
        } catch (error: any) {
            message.error(error.message || 'Profile update failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <ProCard title={"Account Information"} loading={loading} extra={<>
                {!editMode && (
                    <Button type="primary" onClick={() => setEditMode(true)}>
                        Edit Profile
                    </Button>
                )}
            </>}>
                {userData && (
                    <ProForm
                        initialValues={{
                            email: userData.email,
                            departmentId: userData.departmentId,
                            positionId: userData.positionId,
                            role: userData.roles[0],
                            staffMatricNo: userData.staffMatricNo,
                            name: userData.name,
                            contactNumber: userData.contactNumber,
                        }}
                        onFinish={handleSubmit}
                        disabled={!editMode}
                        layout="vertical"
                        submitter={{
                            render: () =>
                                editMode && (
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                        <Button
                                            onClick={() => {
                                                // reset to last saved state
                                                setEditMode(false);
                                            }}
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={submitting}
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                ),
                        }}
                    >
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <ProFormText
                                    name="email"
                                    label="Email"
                                    disabled
                                    rules={[{ required: true, message: 'Please enter your email' }]}
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <ProFormSelect
                                    name="departmentId"
                                    label="Faculty/Department"
                                    options={departments.map(r => ({ label: r.name, value: r.id }))}
                                    rules={[{ required: true, message: 'Please select your faculty / department' }]}
                                />
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <ProFormText
                                    name="staffMatricNo"
                                    label="Staff / Matric No."
                                    rules={[{ required: true, message: 'Please enter staff / matric No.' }]}
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <ProFormSelect
                                    name="positionId"
                                    label="Position"
                                    disabled
                                    options={positions.map(r => ({ label: r.name, value: r.id }))}
                                    rules={[{ required: true, message: 'Please select a position' }]}
                                />
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <ProFormText
                                    name="name"
                                    label="Full Name"
                                    rules={[{ required: true, message: 'Enter your name' }]}
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <ProFormSelect
                                    name="role"
                                    label="Role"
                                    options={roleOptions}
                                    disabled
                                    rules={[{ required: true, message: 'Please select a role' }]}
                                />
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <ProFormText
                                    name="contactNumber"
                                    label="Contact No."
                                    rules={[
                                        { required: true, message: 'Enter your contact number' },
                                        {
                                            pattern: /^\+?\d{10,15}$/,
                                            message: 'Enter a valid contact number (10-15 digits, optional +)',
                                        },
                                    ]}
                                />
                            </Col>
                        </Row>
                    </ProForm>
                )}
            </ProCard>
        </>
    );
};

export default EditProfileForm;
