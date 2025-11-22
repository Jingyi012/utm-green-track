import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import WasteRecordManagement from "@/components/wasteRecords/WasteRecordManagement";

export default function ViewFormPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Data Entry' },
                { title: 'View Form' }
            ]} />
            <WasteRecordManagement />
        </div>
    );
}