import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import WasteRecordManagement from "@/components/wasteRecords/WasteRecordManagement";

export default function WasteRecordManagementPage() {
    return (
        <>
            <CustomBreadcrumb items={[
                { title: 'Waste Record Management' }
            ]} />
            <WasteRecordManagement />
        </>
    );
}