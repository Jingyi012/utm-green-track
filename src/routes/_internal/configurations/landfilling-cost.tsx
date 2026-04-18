import { createFileRoute } from '@tanstack/react-router';
import { LandfillingCostConfig } from '@/components/configuration/GeneralConfig';

export const Route = createFileRoute('/_internal/configurations/landfilling-cost')({
  component: LandfillingCostConfig,
});
