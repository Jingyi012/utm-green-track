# TanStack Query & Global Error Handling Refactoring

## Overview

This document describes the refactoring completed to move query keys to individual hook files and implement global error handling with TanStack Query.

## Architecture Changes

### 1. Global Error Handling

**File**: `src/lib/queryClient.ts`

The query client now includes:

- `getErrorMessage()` - Helper function to extract error messages from API responses
- `createGlobalErrorHandler()` - Global error handler factory
- `throwOnError: true` configured for both queries and mutations

**Error Flow**:

```
API Response/Error → axios interceptors → TanStack Query → getErrorMessage()
→ Ant Design message.error()
```

### 2. Query Keys by Entity

Query keys are now defined in individual hook files instead of a centralized file:

#### Enquiry (`src/hook/enquiry.ts`)

```typescript
export const enquiryQueryKeys = {
  all: ['enquiry'] as const,
  lists: () => [...enquiryQueryKeys.all, 'list'] as const,
  list: (filters: EnquiryListFilters) => [...enquiryQueryKeys.lists(), { ...filters }] as const,
  details: () => [...enquiryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...enquiryQueryKeys.details(), id] as const,
};
```

**Hooks Available**:

- `useEnquiryList(filters)` - Fetch enquiry list
- `useCreateEnquiry()` - Create enquiry
- `useUpdateEnquiryStatus()` - Update enquiry status
- `useDeleteEnquiry()` - Delete enquiry

#### Waste Records (`src/hook/wasteRecords.ts`)

Query keys for waste records with pagination, statistics, and analytics.

**Hooks Available**:

- `useWasteRecordList(filters)` - Paginated waste records
- `useWasteRecordDetail(id)` - Single waste record
- `useWasteStatistics(year, campusId, departmentId)` - Statistics
- `useYearlySummary(campusId, year)` - Yearly summary
- `useYearlyAnalytics(year, campusId)` - Yearly analytics
- `useLifetimeAnalytics(campusId)` - Lifetime analytics
- `useUpdateWasteRecord()` - Update record
- `useDeleteWasteRecord()` - Delete record
- `useUploadAttachments()` - Upload files
- `useDeleteAttachment()` - Delete attachment

#### Requests (`src/hook/requests.ts`)

- `useRequestList(filters)` - Fetch requests
- `useUpdateRequestStatus()` - Update status
- `useDeleteRequest()` - Delete request

#### Users (`src/hook/users.ts`)

- `useUserList(filters)` - Fetch users
- `useUpdateUserApprovalStatus()` - Approve/reject users
- `useDeleteUser()` - Delete user
- `useUpdateUser()` - Update user

#### Configuration (`src/hook/departments.ts`, `src/hook/disposalMethods.ts`, `src/hook/configurations.ts`)

- `useDepartmentList()`, `useCreateDepartment()`, `useUpdateDepartment()`, `useDeleteDepartment()`
- `useDisposalMethodList()`, `useCreateDisposalMethod()`, `useUpdateDisposalMethod()`, `useDeleteDisposalMethod()`
- `useWasteTypeList()`, `useCreateWasteType()`, `useUpdateWasteType()`, `useDeleteWasteType()`
- `useConfigList()`, `useUpdateConfig()`

## Usage Pattern

### Before (Manual try-catch):

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    const res = await getAllUsers({ pageNumber: 1, pageSize: 20 });
    if (res.success) {
      setData(res.data);
    } else {
      message.error(res.message);
    }
  } catch (err) {
    message.error('Failed to fetch users');
  } finally {
    setLoading(false);
  }
};
```

### After (With Hooks):

```typescript
const queryClient = useQueryClient();
const { data: userData, isLoading } = useUserList({ pageNumber: 1, pageSize: 20 });
const { mutate: updateUserMutate, isPending: isUpdating } = useUpdateUser();

// Update handler
const handleUpdate = (user: UserDetails) => {
  updateUserMutate(
    { id: user.id, updatedData: user },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      },
    },
  );
};
```

## Key Benefits

1. **No More Try-Catch**: Errors are automatically handled by hooks and shown via Ant Design message
2. **Centralized Query Keys**: Each entity has its query key definition for easy maintenance
3. **Type-Safe**: Full TypeScript support for query keys and hook parameters
4. **Automatic Invalidation**: Hooks automatically manage cache invalidation
5. **Consistent Error Handling**: All errors follow same pattern - message notification
6. **Easy Testing**: Hooks can be mocked independently
7. **Performance**: Automatic deduplication and caching of identical queries

## Component Status

### Fully Refactored ✅

- `EnquiryList.tsx` - Using enquiry hooks
- `RequestManagement.tsx` - Using request hooks
- `DepartmentConfig.tsx` - Using department hooks
- `UserManagement.tsx` - Using user hooks (export try-catch can remain)
- `UserApproval.tsx` - Using user hooks

### Partially Refactored 🟡

- `WasteRecordManagement.tsx` - Uses hooks but export/request operations still have try-catch
- `DisposalWasteConfig.tsx` - Uses old queryKeys pattern, should be migrated
- `GeneralConfig.tsx` - Uses old queryKeys pattern, should be migrated

## Migration Checklist

For each component migration:

- [ ] Import hooks from appropriate hook file
- [ ] Import queryKeys from same hook file
- [ ] Remove manual state for `loading`, `selectedData`
- [ ] Replace `useQuery` direct calls with custom hooks
- [ ] Replace `useMutation` direct calls with custom mutation hooks
- [ ] Remove try-catch blocks, let hooks handle errors
- [ ] Replace `actionRef.current.reload()` with `queryClient.invalidateQueries()`
- [ ] Use `isPending` from mutation hooks for button loading states
- [ ] Ensure success/error callbacks use `queryClient.invalidateQueries()`

## Error Message Extraction

The `getErrorMessage()` function handles:

```typescript
// API Response Error
{
  response: {
    data: {
      message: 'Custom error message';
    }
  }
}

// Standard Error
{
  message: 'Error message';
}

// Default
('An error occurred. Please try again.');
```

## Future Enhancements

1. Add error boundary for unhandled errors
2. Implement retry strategy for specific error types
3. Add analytics tracking for errors
4. Implement request cancellation on component unmount
5. Add optimistic updates for mutations
6. Implement refetch interval strategies

## Related Files

- Query Client Config: `src/lib/queryClient.ts`
- Hook Files: `src/hook/*.ts`
- AppProvider: `src/contexts/AppProvider.tsx`
