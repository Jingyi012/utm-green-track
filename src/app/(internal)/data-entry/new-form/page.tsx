import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import WasteEntryForm from "@/components/DataEntry/NewForm";

export default function NewFormPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Data Entry' },
                { title: 'New Forms' }
            ]} />
            <WasteEntryForm />
        </div>
    );
}