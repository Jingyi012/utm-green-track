import { createFileRoute } from '@tanstack/react-router';
import DisposalWasteConfig from '@/components/configuration/DisposalWasteConfig';

export const Route = createFileRoute('/_internal/configurations/disposal-waste')({
  component: DisposalWasteConfig,
});
