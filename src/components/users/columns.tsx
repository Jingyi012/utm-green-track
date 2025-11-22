import { UserStatus } from "@/lib/enum/status";
import { UserDetails } from "@/lib/types/typing";
import { ProColumns } from "@ant-design/pro-components";
import { Tag } from "antd";

export const getBaseUserColumns = (params: {
    positions: { id: string; name: string }[];
    departments: { id: string; name: string }[];
    roles: { id: string; name: string }[];
}): ProColumns<UserDetails>[] => {
    const { positions, departments, roles } = params;

    const listToValueEnum = (list: { id: string; name: string }[]) =>
        list.reduce((acc, item) => {
            acc[item.id] = { text: item.name };
            return acc;
        }, {} as Record<string, { text: string }>);

    return [
        {
            title: "No.",
            render: (_: any, __: any, index: number, action) => {
                const current = action?.pageInfo?.current ?? 1;
                const pageSize = action?.pageInfo?.pageSize ?? 10;
                return (current - 1) * pageSize + index + 1;
            },
            width: 60,
            align: "center",
            hideInSearch: true,
        },
        {
            title: "Name",
            dataIndex: "name",
            align: "center",
        },
        { title: "Email", dataIndex: "email", align: "center" },
        { title: "Contact", dataIndex: "contactNumber", align: "center" },
        { title: "Staff / Matric No", dataIndex: "staffMatricNo", align: "center" },
        {
            title: "Department",
            dataIndex: "departmentId",
            align: "center",
            valueEnum: listToValueEnum(departments),
            render: (_, record) => record.department ?? "-",
        },
        {
            title: "Unit",
            dataIndex: "unit",
            align: "center",
        },
        {
            title: "Position",
            dataIndex: "positionId",
            align: "center",
            valueEnum: listToValueEnum(positions),
            render: (_, record) => record.position ?? "-",
        },
        {
            title: "Role",
            dataIndex: "roleIds",
            align: "center",
            valueEnum: listToValueEnum(roles),
            render: (_, record) => {
                if (!record.roleIds || record.roleIds.length === 0) return "-";
                return (
                    <>
                        {record.roleIds.map((roleId) => {
                            const role = roles.find(r => r.id === roleId);
                            return <Tag key={roleId}>{role ? role.name : roleId}</Tag>;
                        })}
                    </>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            align: "center",
            hideInSearch: true,
            valueEnum: {
                [UserStatus.Pending]: { text: "Pending", status: "Default" },
                [UserStatus.Approved]: { text: "Approved", status: "Success" },
                [UserStatus.Rejected]: { text: "Rejected", status: "Error" },
            },
        },
    ] as ProColumns<UserDetails>[];
};