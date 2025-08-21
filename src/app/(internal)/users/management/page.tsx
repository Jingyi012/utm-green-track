import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import UserManagement from "@/components/users/UserManagement";

export default function UserManagementPage() {
    return (
        <>
            <CustomBreadcrumb items={[
                { title: 'Users' },
                { title: 'Management' }
            ]} />
            <UserManagement />
        </>
    );
}