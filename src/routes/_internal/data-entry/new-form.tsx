import { createFileRoute } from '@tanstack/react-router';
import WasteEntryForm from '@/components/dataEntry/NewForm';

export const Route = createFileRoute('/_internal/data-entry/new-form')({
  component: WasteEntryForm,
});
