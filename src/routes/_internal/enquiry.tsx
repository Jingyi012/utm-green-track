import { createFileRoute } from '@tanstack/react-router';
import { EnquiryList } from '@/components/enquiry/EnquiryList';

export const Route = createFileRoute('/_internal/enquiry')({
  component: EnquiryList,
});
