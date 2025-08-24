import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import { GeneralConfigLayout } from "@/components/configuration/GeneralConfigLayout";

export default function GeneralConfigurationPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Configurations' },
            ]} />
            <GeneralConfigLayout />
        </div>
    )
}