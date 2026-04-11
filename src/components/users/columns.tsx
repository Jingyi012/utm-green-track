import { UserStatus } from "@/lib/enum/status";
import { UserDetails } from "@/lib/types/typing";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { Tooltip } from "antd";

const renderEllipsisText = (value: string | undefined, maxWidth = 180) => {
    const text = value?.trim() || "-";
    if (text === "-") return text;

    return (
        <Tooltip title={text}>
            <span
                style={{
                    display: "inline-block",
                    maxWidth,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    verticalAlign: "bottom",
                }}
            >
                {text}
            </span>
        </Tooltip>
    );
};

export const getBaseUserColumns = (params: {
    positions: { id: string; name: string }[];
    departments: { id: string; name: string }[];
    roles: { id: string; name: string }[];
}): ProColumns<UserDetails>[] => {
    const { positions, departments, roles } = params;
    const roleNameMap = roles.reduce<Record<string, string>>((acc, role) => {
        acc[role.id] = role.name;
        return acc;
    }, {});

    const listToValueEnum = (list: { id: string; name: string }[]) =>
        list.reduce((acc, item) => {
            acc[item.id] = { text: item.name };
            return acc;
        }, {} as Record<string, { text: string }>);

    return [
        {
            title: "No.",
            render: (_: unknown, __: UserDetails, index: number, action?: ActionType) => {
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
            width: 180,
            ellipsis: true,
            align: "center",
            render: (_: unknown, record) => renderEllipsisText(record.name, 160),
        },
        {
            title: "Email",
            dataIndex: "email",
            width: 220,
            ellipsis: true,
            align: "center",
            render: (_: unknown, record) => renderEllipsisText(record.email, 200)
        },
        {
            title: "Contact",
            dataIndex: "contactNumber",
            width: 140,
            align: "center",
        },
        {
            title: "Staff / Matric No",
            dataIndex: "staffMatricNo",
            width: 160,
            ellipsis: true,
            align: "center",
            render: (_: unknown, record) => renderEllipsisText(record.staffMatricNo, 140)
        },
        {
            title: "Faculty / Department / College / PTJ",
            dataIndex: "departmentId",
            width: 220,
            ellipsis: true,
            align: "center",
            valueEnum: listToValueEnum(departments),
            render: (_, record) => renderEllipsisText(record.department, 200),
        },
        {
            title: "Unit",
            dataIndex: "unit",
            width: 180,
            ellipsis: true,
            align: "center",
            render: (_: unknown, record) => renderEllipsisText(record.unit, 160),
        },
        {
            title: "Position",
            dataIndex: "positionId",
            width: 170,
            ellipsis: true,
            align: "center",
            valueEnum: listToValueEnum(positions),
            render: (_, record) => renderEllipsisText(record.position, 150),
        },
        {
            title: "Role",
            dataIndex: "roleIds",
            width: 220,
            ellipsis: true,
            align: "center",
            valueEnum: listToValueEnum(roles),
            render: (_, record) => {
                if (!record.roleIds || record.roleIds.length === 0) return "-";

                const roleNames = record.roleIds.map((roleId) => roleNameMap[roleId] ?? roleId);
                const preview = roleNames.slice(0, 2).join(", ");
                const suffix = roleNames.length > 2 ? ` +${roleNames.length - 2}` : "";
                const content = `${preview}${suffix}`;

                return (
                    <Tooltip title={roleNames.join(", ")}>
                        <span
                            style={{
                                display: "inline-block",
                                maxWidth: 200,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                verticalAlign: "bottom",
                            }}
                        >
                            {content}
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 120,
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

