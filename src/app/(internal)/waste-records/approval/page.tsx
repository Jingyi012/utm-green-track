import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import WasteRecordApproval from "@/components/wasteRecords/WasteRecordApproval";

export default function WasteRecordApprovalPage() {
    return (
        <>
            <CustomBreadcrumb items={[
                { title: 'Waste Records' },
                { title: 'Approval' }
            ]} />
            <WasteRecordApproval />
        </>
    );
}