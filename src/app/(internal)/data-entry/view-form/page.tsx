import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import ViewForm from "@/components/DataEntry/ViewForm";

export default function ViewFormPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Data Entry' },
                { title: 'View Form' }
            ]} />
            <ViewForm />
        </div>
    );
}