import HomeSection from "@/components/home/HomeSection";
import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";

export default function AboutUsPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'About Us' }
            ]} />
            <HomeSection />
        </div>
    );
}