'use client';
import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";

export default function ChangePasswordPage() {
    return (
        <>
            <CustomBreadcrumb items={
                [
                    { title: 'Settings' },
                    { title: 'Change Password' },
                ]
            }
            />
            <ChangePasswordForm />
        </>
    )
}