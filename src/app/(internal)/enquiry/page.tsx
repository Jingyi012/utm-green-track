import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";
import { EnquiryList } from "@/components/enquiry/EnquiryList";

export default function EnquiryPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'Enquiry' }
            ]} />
            <EnquiryList />
        </div>
    );
}