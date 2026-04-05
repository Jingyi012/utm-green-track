import RolePermissions from '@/components/configuration/RolePermissions';

export default function RolePermissionsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Role Permissions</h1>
        <p className="text-gray-600 mt-2">Manage permissions for each role in the system</p>
      </div>
      <RolePermissions />
    </div>
  );
}
