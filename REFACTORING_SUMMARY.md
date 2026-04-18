# Refactoring Summary: TanStack Query & Global Error Handling

## What Was Done

### 1. Global Error Handling Setup ✅

**File**: `src/lib/queryClient.ts`

Added centralized error handling:

- `getErrorMessage()` - Extracts error messages from API responses
- `createGlobalErrorHandler()` - Factory function for global error handler
- Configured `throwOnError: true` for all queries and mutations
- Errors automatically display via Ant Design message notifications

**Benefits**:

- No more manual try-catch blocks needed
- Consistent error messaging across the app
- Reduces boilerplate code significantly

### 2. Query Keys Decentralized ✅

Moved query keys from centralized `queryKeys.ts` to individual hook files for better organization:

| Entity               | Hook File                     | Query Keys                              |
| -------------------- | ----------------------------- | --------------------------------------- |
| Enquiry              | `src/hook/enquiry.ts`         | `enquiryQueryKeys`                      |
| Waste Records        | `src/hook/wasteRecords.ts`    | `wasteRecordQueryKeys`                  |
| Requests             | `src/hook/requests.ts`        | `requestQueryKeys`                      |
| Users                | `src/hook/users.ts`           | `userQueryKeys`                         |
| Departments          | `src/hook/departments.ts`     | `departmentQueryKeys`                   |
| Disposal Methods     | `src/hook/disposalMethods.ts` | `disposalMethodQueryKeys`               |
| Waste Types & Config | `src/hook/configurations.ts`  | `wasteTypeQueryKeys`, `configQueryKeys` |

### 3. Custom Hooks Created ✅

#### Enquiry Hooks

- `useEnquiryList(filters)` - Query with automatic pagination
- `useCreateEnquiry()` - Mutation with auto-invalidation
- `useUpdateEnquiryStatus()` - Status update mutation
- `useDeleteEnquiry()` - Delete mutation

#### Waste Records Hooks

- `useWasteRecordList(filters)` - Paginated records
- `useWasteRecordDetail(id)` - Single record fetch
- `useWasteStatistics()` - Statistics query
- `useYearlySummary()` & `useYearlyAnalytics()` - Analytics
- `useUpdateWasteRecord()` - Update mutation
- `useDeleteWasteRecord()` - Delete mutation
- `useUploadAttachments()` & `useDeleteAttachment()` - File operations

#### Request Hooks

- `useRequestList(filters)` - Fetch requests
- `useUpdateRequestStatus()` - Status update
- `useDeleteRequest()` - Delete request

#### User Hooks

- `useUserList(filters)` - User list with filters
- `useUpdateUserApprovalStatus()` - Approval mutation
- `useUpdateUser()` - User update
- `useDeleteUser()` - User delete

#### Configuration Hooks

- Department: CRUD operations
- Disposal Methods: CRUD operations
- Waste Types: CRUD operations
- General Config: Read & update operations

### 4. Components Refactored ✅

**Fully Refactored** (Using hooks, no try-catch):

- ✅ `EnquiryList.tsx` - All query/mutations using hooks
- ✅ `RequestManagement.tsx` - All operations using hooks
- ✅ `UserManagement.tsx` - User operations using hooks
- ✅ `UserApproval.tsx` - Approval operations using hooks
- ✅ `DepartmentConfig.tsx` - Department CRUD using hooks

**Partially Refactored** (Core logic uses hooks, utility operations may have try-catch):

- 🟡 `WasteRecordManagement.tsx` - Core operations use hooks; export functions use try-catch
- 🟡 `DisposalWasteConfig.tsx` - Should be updated to use disposalMethod & wasteType hooks
- 🟡 `GeneralConfig.tsx` - Should be updated to use config hooks

## Code Example: Before & After

### Before (Manual Error Handling)

```typescript
const [data, setData] = useState<Enquiry[]>([]);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    const res = await getAllEnquiry({ pageNumber: 1, pageSize: 20 });
    if (res.success) {
      setData(res.data);
    } else {
      message.error(res.message || 'Failed to fetch');
    }
  } catch (err) {
    message.error(err?.response?.data?.message || 'Failed to fetch');
  } finally {
    setLoading(false);
  }
};
```

### After (Using Hooks)

```typescript
const { data: enquiryData, isLoading } = useEnquiryList({
  pageNumber: 1,
  pageSize: 20,
});

// Error handling is automatic - no try-catch needed!
```

## How to Use the New System

### 1. Querying Data

```typescript
import { useEnquiryList, enquiryQueryKeys } from '@/hook/enquiry';

const MyComponent = () => {
  const [filters, setFilters] = useState({ pageNumber: 1, pageSize: 20 });
  const { data: enquiryData, isLoading, error } = useEnquiryList(filters);

  return (
    <Table
      loading={isLoading}
      dataSource={enquiryData?.data}
      pagination={{ total: enquiryData?.totalCount }}
    />
  );
};
```

### 2. Mutations with Error Handling

```typescript
const { mutate: updateStatusMutate, isPending } = useUpdateEnquiryStatus();

const handleStatusChange = (id: string, status: number) => {
  updateStatusMutate(
    { enquiryId: id, status },
    {
      onSuccess: () => {
        message.success('Status updated'); // Shown automatically
        queryClient.invalidateQueries({ queryKey: enquiryQueryKeys.lists() });
      },
      // onError is handled automatically by the hook
    },
  );
};
```

### 3. Working with Query Keys

```typescript
import { enquiryQueryKeys } from '@/hook/enquiry';

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: enquiryQueryKeys.lists() });

// Invalidate specific detail
queryClient.invalidateQueries({ queryKey: enquiryQueryKeys.detail('id123') });

// Remove from cache
queryClient.removeQueries({ queryKey: enquiryQueryKeys.lists() });
```

## Recommendations for Future Work

### High Priority

1. Update `DisposalWasteConfig.tsx` to use `useDisposalMethodList()` and `useWasteTypeList()`
2. Update `GeneralConfig.tsx` to use `useConfigList()` and `useUpdateConfig()`
3. Update remaining detail drawers to use hooks

### Medium Priority

1. Implement error boundary component for unhandled errors
2. Add request cancellation (AbortController) for cleanup
3. Implement optimistic updates for mutations
4. Add analytics tracking for errors

### Consider Later

1. Add offline support with persistent cache
2. Implement intelligent retry strategies
3. Add progress indicators for long operations
4. Implement selective query invalidation patterns

## Files Modified

### Core Infrastructure

- `src/lib/queryClient.ts` - Global error handler added
- `src/lib/queryKeys.ts` - Marked deprecated with migration guide

### New Hooks (Query Key + Hook Definitions)

- `src/hook/enquiry.ts` - NEW
- `src/hook/wasteRecords.ts` - NEW
- `src/hook/requests.ts` - NEW
- `src/hook/users.ts` - NEW
- `src/hook/departments.ts` - NEW
- `src/hook/disposalMethods.ts` - NEW
- `src/hook/configurations.ts` - NEW

### Components Updated

- `src/components/enquiry/EnquiryList.tsx` - Refactored
- `src/components/request/RequestManagement.tsx` - Refactored
- `src/components/users/UserManagement.tsx` - Refactored
- `src/components/users/UserApproval.tsx` - Refactored
- `src/components/configuration/DepartmentConfig.tsx` - Already using hooks
- `src/components/wasteRecords/WasteRecordManagement.tsx` - Core operations refactored

### Documentation

- `TANSTACK_QUERY_REFACTORING.md` - Complete guide

## Testing the Changes

### What to Test

1. ✅ Verify error messages display correctly when API calls fail
2. ✅ Check that data loads properly in all management tables
3. ✅ Confirm create/update/delete operations work and show correct messages
4. ✅ Test pagination and filtering in refactored components
5. ✅ Verify no console warnings about missing/stale queries

### Testing Each Component

```bash
# Test Enquiry functionality
1. Navigate to Enquiry page
2. Create new enquiry → should show success message
3. Update status → should refresh data
4. Delete enquiry → should confirm and remove

# Test Waste Records
1. View waste records list
2. Create new record → verify success message
3. Update record → check data refresh
4. Test export functions

# Test Users
1. View user list
2. Approve/reject user → automatic refresh
3. Delete user → confirm action
4. Check export functionality
```

## Migration Path for Remaining Components

For any component still using old pattern:

1. **Add imports** from corresponding hook file:

   ```typescript
   import { use<Entity>List, use<Action>, <entity>QueryKeys } from '@/hook/<entity>';
   import { useQueryClient } from '@tanstack/react-query';
   ```

2. **Replace manual state** with hook data:

   ```typescript
   // Before
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(false);

   // After
   const { data, isLoading } = use < Entity > List(filters);
   ```

3. **Replace mutations** with hook mutations:

   ```typescript
   // Before
   try {
     const res = await createEntity(data);
     message.success('Created');
   } catch (err) {
     message.error('Failed');
   }

   // After
   const { mutate, isPending } = useCreate<Entity>();
   mutate(data, {
     onSuccess: () => queryClient.invalidateQueries(...)
   });
   ```

4. **Test thoroughly** before committing

## Support & Questions

For questions about the new query system:

1. See `TANSTACK_QUERY_REFACTORING.md` for detailed guide
2. Check existing hook implementations as examples
3. Refer to TanStack Query docs: https://tanstack.com/query/latest

For issues with error handling:

1. Check `src/lib/queryClient.ts` for global config
2. Verify API responses include `message` field
3. Check Ant Design message component is configured
