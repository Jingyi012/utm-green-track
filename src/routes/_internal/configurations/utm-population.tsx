import { createFileRoute } from '@tanstack/react-router';
import { UtmPopulationConfig } from '@/components/configuration/GeneralConfig';

export const Route = createFileRoute('/_internal/configurations/utm-population')({
  component: UtmPopulationConfig,
});
