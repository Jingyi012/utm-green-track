# ProTable Reload & Refetch Integration Guide

## Quick Start

### For Existing Tables Using Hooks

```typescript
import { useYourHook, yourQueryKeys } from '@/hook/your-entity';
import { useRef } from 'react';
import { ActionType } from '@ant-design/pro-components';

const YourComponent: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const queryClient = useQueryClient();

  // Get data and refetch from hook
  const { data = [], refetch } = useYourHook();

  // Create request handler that supports reload
  const handleTableRequest = async () => {
    await refetch();
    return {
      data,
      success: true,
    };
  };

  return (
    <ProTable
      actionRef={actionRef}
      dataSource={data}
      request={handleTableRequest}
      // ... other props
    />
  );
};
```

### Triggering Reload Programmatically

```typescript
// Option 1: Using actionRef (now works with refetch)
actionRef.current?.reload();

// Option 2: Using refetch directly
const { refetch } = useYourHook();
await refetch();

// Option 3: Using queryClient invalidation (cached, auto-refetch)
queryClient.invalidateQueries({ queryKey: yourQueryKeys.lists() });
```

## Pattern Comparison

### Old Pattern (Deprecated)

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    const res = await fetchAPI();
    setData(res.data);
  } catch (err) {
    message.error('Failed to fetch');
  } finally {
    setLoading(false);
  }
};

// Manual reload
const handleReload = () => fetchData();
```

### New Pattern (Recommended)

```typescript
const { data = [], refetch, isLoading } = useYourHook();

const handleTableRequest = async () => {
  await refetch();
  return { data, success: true };
};

// Automatic reload with actionRef
actionRef.current?.reload(); // calls handleTableRequest → refetch
```

## Available Hooks & Query Keys

### Configuration Hooks

#### Departments

```typescript
import { useDepartmentList, departmentQueryKeys } from '@/hook/departments';

const { data, refetch, isLoading } = useDepartmentList();
// Query key: departmentQueryKeys.lists()
```

#### Disposal Methods

```typescript
import { useDisposalMethodList, disposalMethodQueryKeys } from '@/hook/disposalMethods';

const { data, refetch, isLoading } = useDisposalMethodList();
// Query key: disposalMethodQueryKeys.lists()
```

#### Waste Types & General Config

```typescript
import {
  useWasteTypeList,
  useConfigList,
  wasteTypeQueryKeys,
  configQueryKeys,
} from '@/hook/configurations';

const { data: wasteTypes, refetch: refetchWasteTypes } = useWasteTypeList();
const { data: configs, refetch: refetchConfigs } = useConfigList();
// Query keys: wasteTypeQueryKeys.lists(), configQueryKeys.lists()
```

#### Profile & Waste Record Options

```typescript
import { useProfileDropdownOptions, useWasteRecordDropdownOptions } from '@/hook/options';

const { departments, roles, positions, refetch } = useProfileDropdownOptions();
const { campuses, disposalMethods, refetch } = useWasteRecordDropdownOptions();
// Query keys: profileOptionsQueryKeys.all, wasteRecordOptionsQueryKeys.all
```

#### Role Permissions

```typescript
import {
  useRolePermissionMetadata,
  useRolePermissions,
  rolePermissionQueryKeys,
} from '@/hook/rolePermission';

const { roles, availablePermissions, refetch } = useRolePermissionMetadata();
const { rolePermissions, refetch } = useRolePermissions(roleId);
// Query keys: rolePermissionQueryKeys.metadata(), rolePermissionQueryKeys.permission(roleId)
```

## ProTable Reload Examples

### Example 1: Simple Reload on Success

```typescript
const handleUpdate = async (record) => {
  updateMutate(record, {
    onSuccess: () => {
      // Trigger reload after successful update
      actionRef.current?.reload();
    },
  });
};
```

### Example 2: Conditional Reload

```typescript
const handleDelete = async (id) => {
  const success = await deleteItem(id);
  if (success) {
    // Only reload if delete was successful
    actionRef.current?.reload();
  }
};
```

### Example 3: Reload with QueryClient Invalidation

```typescript
const handleBatchUpdate = async (ids, newStatus) => {
  updateMutate(
    { ids, newStatus },
    {
      onSuccess: () => {
        // Invalidate all related queries
        queryClient.invalidateQueries({ queryKey: yourQueryKeys.lists() });
        // ProTable will automatically refetch
        actionRef.current?.reload();
      },
    },
  );
};
```

## Error Handling

Errors are automatically handled by:

1. Hook error handler (shows message via Ant Design)
2. Global TanStack Query error handling
3. Component-level error boundaries

**No manual try-catch needed!**

```typescript
// ❌ Don't do this
try {
  const res = await fetchData();
} catch (err) {
  message.error('Failed');
}

// ✅ Do this instead
const { data, error, isError } = useYourHook();

if (isError) {
  return <ErrorComponent error={error} />;
}
```

## Query Key Patterns

All query keys follow this pattern:

```typescript
export const entityQueryKeys = {
  all: ['entity'] as const, // Base key
  lists: () => [...all, 'list'], // Collection queries
  list: (filters) => [...lists(), { ...filters }], // Filtered collections
  details: () => [...all, 'detail'], // Details collection
  detail: (id) => [...details(), id], // Single detail
} as const;
```

**Usage:**

```typescript
// Invalidate all entity queries
queryClient.invalidateQueries({ queryKey: entityQueryKeys.all });

// Invalidate only list queries (keeps details cached)
queryClient.invalidateQueries({ queryKey: entityQueryKeys.lists() });

// Invalidate specific detail
queryClient.invalidateQueries({ queryKey: entityQueryKeys.detail(id) });
```

## Performance Tips

1. **Use specific query key invalidation** instead of `all`

   ```typescript
   // ✅ Good - only invalidates lists
   queryClient.invalidateQueries({ queryKey: entityQueryKeys.lists() });

   // ❌ Bad - invalidates everything
   queryClient.invalidateQueries({ queryKey: entityQueryKeys.all });
   ```

2. **Use refetch for single component reloads**

   ```typescript
   // ✅ Better - only affects this component
   const { refetch } = useQuery(...);
   await refetch();

   // ❌ Less efficient - affects all components using this query
   queryClient.invalidateQueries({ ... });
   ```

3. **Batch operations before reload**

   ```typescript
   // ✅ Good - single reload after batch updates
   Promise.all([updateItem1(), updateItem2(), updateItem3()]).then(() =>
     actionRef.current?.reload(),
   );

   // ❌ Bad - reloads for each update
   updateItem1().then(() => actionRef.current?.reload());
   updateItem2().then(() => actionRef.current?.reload());
   ```

## Troubleshooting

### Issue: `actionRef.current?.reload()` not working

**Solution:** Ensure:

1. `handleTableRequest` is defined and calls `refetch()`
2. ProTable has `request={handleTableRequest}` prop
3. Hook returns full query object with `refetch`

### Issue: Data not updating after reload

**Solution:** Check:

1. Cache key is correctly invalidated
2. Refetch is being called (check console)
3. Network request succeeds (check Network tab)

### Issue: Performance issues with reload

**Solution:**

1. Use specific query key invalidation
2. Check if multiple reloads are happening
3. Use debouncing if reload is triggered frequently

## Related Documentation

- [TANSTACK_QUERY_REFACTORING.md](./TANSTACK_QUERY_REFACTORING.md) - Architecture overview
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Implementation details
- [QUERY_KEYS_UPDATE.md](./QUERY_KEYS_UPDATE.md) - Recent updates log
