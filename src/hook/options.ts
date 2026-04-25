import { getAllConfig } from '@/lib/services/config';
import { getAllDepartment } from '@/lib/services/department';
import { getAllDisposalMethod } from '@/lib/services/disposalMethod';
import {
  getProfileDropdownOptions,
  getWasteRecordDropdownOptions,
} from '@/lib/services/dropdownOption';
import { getAllWasteType } from '@/lib/services/wasteType';
import { ProfileDropdownOptions, WasteRecordDropdownOptions } from '@/lib/types/typing';
import { useQuery } from '@tanstack/react-query';

// Query Keys
export const profileOptionsQueryKeys = {
  all: ['profile-options'] as const,
} as const;

export const wasteRecordOptionsQueryKeys = {
  all: ['waste-record-options'] as const,
} as const;

export const departmentsQueryKeys = {
  all: ['departments'] as const,
} as const;

export const disposalMethodsQueryKeys = {
  all: ['disposal-methods'] as const,
} as const;

export const wasteTypesQueryKeys = {
  all: ['waste-types'] as const,
} as const;

export const configsQueryKeys = {
  all: ['configs'] as const,
} as const;

const OUTSIDE_CAMPUS_NAME = 'utm (outside campus)';
const THIRTY_MINUTES = 1000 * 60 * 30;

const fetchProfileOptions = async () => {
  const response = await getProfileDropdownOptions();
  return response.data;
};

const fetchWasteRecordOptions = async () => {
  const response = await getWasteRecordDropdownOptions();
  return response.data;
};

const fetchDepartments = async () => {
  const response = await getAllDepartment();
  return response.data;
};

const fetchDisposalMethods = async () => {
  const response = await getAllDisposalMethod();
  return response.data;
};

const fetchWasteTypes = async () => {
  const response = await getAllWasteType();
  return response.data;
};

const fetchConfigs = async () => {
  const response = await getAllConfig();
  return response.data;
};

function sortCampusesWithOutsideLast(campuses: WasteRecordDropdownOptions['campuses']) {
  const insideCampuses = campuses.filter(
    (campus) => campus.name.trim().toLowerCase() !== OUTSIDE_CAMPUS_NAME,
  );
  const outsideCampuses = campuses.filter(
    (campus) => campus.name.trim().toLowerCase() === OUTSIDE_CAMPUS_NAME,
  );

  return [...insideCampuses, ...outsideCampuses];
}

export function useProfileDropdownOptions(): ProfileDropdownOptions & { refetch: any } {
  const { data, isLoading, refetch } = useQuery({
    queryKey: profileOptionsQueryKeys.all,
    queryFn: fetchProfileOptions,
    staleTime: THIRTY_MINUTES,
    throwOnError: true,
  });

  return {
    isLoading,
    refetch,
    departments: data?.departments ?? [],
    roles: data?.roles ?? [],
    positions: data?.positions ?? [],
  };
}

export function useWasteRecordDropdownOptions(): WasteRecordDropdownOptions & { refetch: any } {
  const { data, isLoading, refetch } = useQuery({
    queryKey: wasteRecordOptionsQueryKeys.all,
    queryFn: fetchWasteRecordOptions,
    staleTime: THIRTY_MINUTES,
    throwOnError: true,
  });

  const campuses = sortCampusesWithOutsideLast(data?.campuses ?? []);

  return {
    isLoading,
    refetch,
    campuses,
    disposalMethods: data?.disposalMethods ?? [],
  };
}

export function useDepartments() {
  return useQuery({
    queryKey: departmentsQueryKeys.all,
    queryFn: fetchDepartments,
    staleTime: THIRTY_MINUTES,
    throwOnError: true,
  });
}

export function useDisposalMethods() {
  return useQuery({
    queryKey: disposalMethodsQueryKeys.all,
    queryFn: fetchDisposalMethods,
    staleTime: THIRTY_MINUTES,
    throwOnError: true,
  });
}

export function useWasteTypes() {
  return useQuery({
    queryKey: wasteTypesQueryKeys.all,
    queryFn: fetchWasteTypes,
    staleTime: THIRTY_MINUTES,
    throwOnError: true,
  });
}

export function useConfigs() {
  return useQuery({
    queryKey: configsQueryKeys.all,
    queryFn: fetchConfigs,
    staleTime: THIRTY_MINUTES,
    throwOnError: true,
  });
}
