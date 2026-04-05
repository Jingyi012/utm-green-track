import { getAllConfig } from '@/lib/services/config';
import { getAllDepartment } from '@/lib/services/department';
import { getAllDisposalMethod } from '@/lib/services/disposalMethod';
import {
  getProfileDropdownOptions,
  getWasteRecordDropdownOptions,
} from '@/lib/services/dropdownOption';
import { getAllWasteType } from '@/lib/services/wasteType';
import { ProfileDropdownOptions, WasteRecordDropdownOptions } from '@/lib/types/typing';
import useSWR from 'swr';

const OUTSIDE_CAMPUS_NAME = 'utm (outside campus)';

function sortCampusesWithOutsideLast(campuses: WasteRecordDropdownOptions['campuses']) {
  const insideCampuses = campuses.filter(
    (campus) => campus.name.trim().toLowerCase() !== OUTSIDE_CAMPUS_NAME
  );
  const outsideCampuses = campuses.filter(
    (campus) => campus.name.trim().toLowerCase() === OUTSIDE_CAMPUS_NAME
  );

  return [...insideCampuses, ...outsideCampuses];
}

export function useProfileDropdownOptions(): ProfileDropdownOptions {
  const { data, isLoading } = useSWR('profile-options', () => getProfileDropdownOptions(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 30,
  });

  return {
    isLoading,
    departments: data?.data.departments ?? [],
    roles: data?.data.roles ?? [],
    positions: data?.data.positions ?? [],
  };
}

export function useWasteRecordDropdownOptions(): WasteRecordDropdownOptions {
  const { data, isLoading } = useSWR('waste-options', () => getWasteRecordDropdownOptions(), {
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 30,
  });

  const campuses = sortCampusesWithOutsideLast(data?.data.campuses ?? []);

  return {
    isLoading,
    campuses,
    disposalMethods: data?.data.disposalMethods ?? [],
  };
}

export function useDepartments() {
  return useSWR('departments', () => getAllDepartment(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 30,
  });
}

export function useDisposalMethods() {
  return useSWR('disposalMethods', () => getAllDisposalMethod(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 30,
  });
}

export function useWasteTypes() {
  return useSWR('wasteTypes', () => getAllWasteType(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 30,
  });
}

export function useConfigs() {
  return useSWR('configs', () => getAllConfig(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 30,
  });
}
