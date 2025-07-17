'use client';
import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import EditProfileForm from "@/components/settings/EditProfileForm";

export default function EditProfilePage() {
    return (
        <>
            <CustomBreadcrumb items={
                [
                    { title: 'Settings' },
                    { title: 'Edit Profile' },
                ]
            }
            />
            <EditProfileForm />
        </>
    )
}