import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import WasteManagementTable from "@/components/DataEntry/Statistic";

export default function StatisticPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Data Entry' },
                { title: 'Statistic' }
            ]} />
            <WasteManagementTable />
        </div>
    );
}