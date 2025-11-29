import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import RequestManagement from "@/components/request/RequestManagement";

export default function RequestPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Request Management' },
            ]} />
            <RequestManagement />
        </div>
    );
}