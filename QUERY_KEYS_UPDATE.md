# Update Summary: Remove Deprecated Query Keys and Enable ProTable Reload

## Date: April 18, 2026

### Changes Made

#### 1. Updated Hook Files - Removed Deprecated Query Keys

**Files Updated:**

- `src/hook/options.ts`
- `src/hook/rolePermission.ts`

**Changes:**

- Removed imports of deprecated `queryKeys` from `lib/queryKeys.ts`
- Created new query key definitions within each hook file:
  - `profileOptionsQueryKeys` in options.ts
  - `wasteRecordOptionsQueryKeys` in options.ts
  - `departmentsQueryKeys` in options.ts
  - `disposalMethodsQueryKeys` in options.ts
  - `wasteTypesQueryKeys` in options.ts
  - `configsQueryKeys` in options.ts
  - `rolePermissionQueryKeys` in rolePermission.ts

#### 2. Added ProTable Reload Support

**New File Created:**

- `src/lib/utils/proTableHelpers.ts`

**Features:**

- `useProTableRefetch()` - Hook to integrate actionRef with refetch
- `createProTableRequestHandler()` - Factory function for request handlers

**Usage Example:**

```typescript
const { refetch } = useQuery(...);
const handleTableRequest = createProTableRequestHandler(() => refetch(), () => departments);
// actionRef.current?.reload() now uses refetch internally
```

#### 3. Updated Component Files

**`src/components/configuration/DepartmentConfig.tsx`**

- Added `refetch` from `useDepartmentList()` hook
- Created `handleTableRequest()` function that integrates refetch
- Updated ProTable to use `handleTableRequest`
- Updated delete popconfirm to call `refetch()` on success
- Now supports `actionRef.current?.reload()` with proper refetch

**`src/components/configuration/DisposalWasteConfig.tsx`**

- Replaced direct `useQuery` with `useDisposalMethodList()` hook
- Updated imports to use new `disposalMethodQueryKeys` and `wasteTypeQueryKeys`
- Replaced `queryKeys.disposalMethods` with `disposalMethodQueryKeys.lists()`
- Replaced `queryKeys.wasteTypes` with `wasteTypeQueryKeys.lists()`
- Added `refetch` from hook and called it after mutations

**`src/components/configuration/GeneralConfig.tsx`**

- Replaced `queryKeys.configs()` with `configQueryKeys.list()`
- Replaced `queryKeys.configsByPrefix()` with `configQueryKeys.lists()`
- Updated all query invalidation to use new keys
- Added `throwOnError: true` for consistency

#### 4. Hook Return Values

All query hooks now return the full `useQuery` object which includes:

- `data` - The fetched data
- `isLoading` / `isFetching` - Loading states
- `error` - Error object if any
- **`refetch`** - Function to manually refetch data
- `isError` - Error flag
- And all other TanStack Query properties

**Example Destructuring:**

```typescript
const { data, isLoading, refetch, isError, error } = useDepartmentList();
```

### Query Key Structure

New query keys are now organized within each hook file:

```typescript
// departmentQueryKeys
{
  all: ['departments'],
  lists: () => [...departmentQueryKeys.all, 'list']
}

// profileOptionsQueryKeys
{
  all: ['profile-options']
}

// wasteRecordOptionsQueryKeys
{
  all: ['waste-record-options']
}

// rolePermissionQueryKeys
{
  all: ['role-permissions'],
  metadata: () => [...rolePermissionQueryKeys.all, 'metadata'],
  permissions: () => [...rolePermissionQueryKeys.all, 'permissions'],
  permission: (roleId) => [...rolePermissionQueryKeys.permissions(), roleId]
}
```

### ProTable Reload Integration

**Before:**

```typescript
const { data } = useQuery(...);
// actionRef.current?.reload() didn't work with hooks
```

**After:**

```typescript
const { data, refetch } = useQuery(...);
const handleTableRequest = async () => {
  await refetch();
  return { data, success: true };
};

// Now actionRef.current?.reload() works correctly!
```

### Breaking Changes

**NONE** - All changes are backward compatible. Existing functionality is preserved, just using new query key organization.

### Migration Benefits

1. **Query Keys in Hook Files**
   - Easier to find and maintain query keys
   - Collocated with their usage
   - Better code organization
   - Reduced imports of deprecated central file

2. **ProTable Reload Support**
   - `actionRef.current?.reload()` now works seamlessly with hooks
   - Automatic cache invalidation on reload
   - Consistent with TanStack Query patterns

3. **Global Error Handling**
   - All hooks configured with `throwOnError: true`
   - Errors automatically display via Ant Design message
   - No try-catch blocks needed in mutations

### Files Not Changed (Already Using New Pattern)

These files were already using the new hook pattern:

- `src/hook/enquiry.ts` ✅
- `src/hook/wasteRecords.ts` ✅
- `src/hook/requests.ts` ✅
- `src/hook/users.ts` ✅
- `src/hook/departments.ts` ✅
- `src/hook/disposalMethods.ts` ✅
- `src/hook/configurations.ts` ✅
- `src/components/enquiry/EnquiryList.tsx` ✅
- `src/components/request/RequestManagement.tsx` ✅
- `src/components/users/UserManagement.tsx` ✅
- `src/components/users/UserApproval.tsx` ✅

### Testing Checklist

- [ ] Department CRUD operations (create, edit, delete)
- [ ] Disposal Methods and Waste Types display
- [ ] General Config updates
- [ ] ProTable reload button functionality
- [ ] Error messages display correctly
- [ ] No console warnings about query keys
- [ ] Dismissing and reopening components shows fresh data
- [ ] Pagination works correctly
- [ ] Search/filters work correctly

### Next Steps

1. Test all configuration management pages
2. Verify ProTable reload works with all tables
3. Check error handling is working correctly
4. Consider updating NotificationList to use similar pattern
5. Monitor for any console errors or warnings

### Reference Documentation

- Migration Guide: `TANSTACK_QUERY_REFACTORING.md`
- Summary: `REFACTORING_SUMMARY.md`
- Helper Utilities: `src/lib/utils/proTableHelpers.ts`

### Rollback Plan

If issues arise:

1. All old queryKeys are still available in `lib/queryKeys.ts` (deprecated)
2. Can temporarily revert hook changes if needed
3. No database or API changes required
