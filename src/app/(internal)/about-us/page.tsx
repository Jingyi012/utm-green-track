import AboutSection from "@/components/aboutUs/AboutSection";
import CustomBreadcrumb from "@/components/breadcrumb/CustomBreadcrumb";

export default function AboutUsPage() {
    return (
        <div>
            <CustomBreadcrumb items={[
                { title: 'About Us' }
            ]} />
            <AboutSection />
        </div>
    );
}