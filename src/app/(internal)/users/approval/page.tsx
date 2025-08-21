import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import UserApproval from "@/components/users/UserApproval";

export default function UserApprovalManagementPage() {
    return (
        <>
            <CustomBreadcrumb items={[
                { title: 'User Records' },
                { title: 'Approval Management' }
            ]} />
            <UserApproval />
        </>
    );
}