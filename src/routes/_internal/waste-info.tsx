import { createFileRoute } from '@tanstack/react-router';
import WasteInfoSection from '@/components/wasteInfo/WasteInfoSection';

export const Route = createFileRoute('/_internal/waste-info')({
  component: WasteInfoSection,
});
