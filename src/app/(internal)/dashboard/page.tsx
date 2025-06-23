import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import DashboardSection from "@/components/dashboard/DashboardSection";

export default function DashboardPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Dashboard' }
            ]} />
            <DashboardSection />
        </div>
    );
}