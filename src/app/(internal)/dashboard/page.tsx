import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import CampusYearSelector from "@/components/dashboard/CampusYearSelector";
import InfoCardGrid from "@/components/dashboard/InfoCardGrid";

export default function DashboardPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Dashboard' }
            ]} />
            <CampusYearSelector />
            <br />
            <InfoCardGrid />
        </div>
    );
}