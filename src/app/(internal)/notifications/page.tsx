import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import NotificationList from "@/components/notification/NotificationList";

export default function NotificationPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Notifications' },
            ]} />
            <NotificationList />
        </div>
    );
}