import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import WasteTable from "@/components/DataEntry/ViewForm";

export default function ViewFormPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Data Entry' },
                { title: 'View Form' }
            ]} />
            <WasteTable />
        </div>
    );
}