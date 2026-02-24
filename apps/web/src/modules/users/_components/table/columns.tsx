import { BadgeWithToolTip } from "@/components/shared/badge-tooltip";
import { AvatarIcon } from "@/components/shared/layouts/sidebar-layout";
import { UserActionCell } from "@/components/shared/table/action.component";
import TitleComponent from "@/components/shared/table/title.component";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/modules/auth/types/auth-type";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center gap-2">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    sortUndefined: "last",
    sortDescFirst: false,
    size: 30,
  },
  {
    id: "firstname",
    header: () => (
      <TitleComponent className="flex justify-center" label="Identity" />
    ),
    accessorKey: "firstname",
    cell: ({ row }) => {
      // const username = row.original.username
      return <AvatarIcon {...row.original} />;
    },
    enableSorting: true,
  },
  {
    id: "matriculation",
    header: () => <TitleComponent label="Matriculation" />,
    accessorKey: "matriculation",
    cell: ({ row }) => {
      const matriculation = row.getValue("matriculation") as string;
      const isDeleted = row.original.isDeleted;
      const style = "line-clamp-1 truncate max-w-[120px]";
      const styleDel = style + " line-through text-muted";
      return (
        <span
          className={`${isDeleted ? styleDel : `${style} text-primary`} text-center`}
        >
          {matriculation || "N/A"}
        </span>
      );
    },
    enableSorting: true,
  },

  {
    id: "role",
    header: () => (
      <TitleComponent className="text-right flex justify-center" label="RBAC" />
    ),
    accessorKey: "role",
    cell: ({ row }) => {
      const role = row.original.role;
      const isDeleted = row.original.isDeleted;
      const styleDel = "line-through bg-muted";

      // Define your role color mapping here
      const roleVariants: Record<
        string,
        "default" | "destructive" | "secondary" | "outline"
      > = {
        SUPER_ADMIN: "destructive", // Red
        ADMIN: "default", // Gray
        MG_AGT: "secondary", // Light gray
        MG_COS: "outline", // Border only
        MG_COB: "default", // Border only
      };

      return (
        <div className="flex items-center justify-center">
          <BadgeWithToolTip
            content={`User is a ${role}`}
            variant={roleVariants[role] || "default"}
            className={`${isDeleted ? styleDel : "capitalize"}`}
          >
            {role.replace("_", " ")}
          </BadgeWithToolTip>
        </div>
      );
    },
  },
  {
    id: "lastLogin",
    header: () => (
      <TitleComponent
        className="text-right flex justify-center"
        label="Last Login"
      />
    ),
    accessorKey: "lastLogin",
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLogin");
      const isDeleted = row.original.isDeleted;

      return (
        <div className="flex items-center justify-end">
          <p className={`${isDeleted ? "line-through text-muted" : "text-sm"}`}>
            {lastLogin ? format(new Date(lastLogin as string), "PP,p") : "N/A"}
          </p>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "statusOverview",
    header: () => (
      <TitleComponent
        className="flex items-center justify-center"
        label="Status"
      />
    ),
    cell: ({ row }) => {
      const {
        // is2FAEnabled,
        //  is2FAValidated,
        isActive,
        isBlocked,
        isDeleted,
      } = row.original;

      return (
        <div className="flex flex-wrap justify-end gap-0.5">
          {isDeleted && (
            <BadgeWithToolTip
              content={"User account was deleted"}
              variant={"destructive"}
            >
              Deleted
            </BadgeWithToolTip>
          )}

          <BadgeWithToolTip
            content={
              isActive ? "User account is active" : "User account is inactive"
            }
            variant={isActive ? "secondary" : "destructive"}
          >
            {isActive ? "Active" : "Inactive"}
          </BadgeWithToolTip>

          {isBlocked && (
            <BadgeWithToolTip
              content={"Account is blocked"}
              variant={"destructive"}
            >
              Account Blocked
            </BadgeWithToolTip>
          )}

          {/* <BadgeWithToolTip
            content={
              is2FAEnabled
                ? is2FAValidated
                  ? "2FA on and validated."
                  : "2FA on but not validated yet."
                : "2FA off."
            }
            variant={is2FAEnabled ? "default" : "pending"}
          >
            2FA {is2FAValidated ? "✅" : "Pending validation"}
          </BadgeWithToolTip> */}
        </div>
      );
    },
  },

  {
    header: () => {
      return <span className="flex justify-end">Actions</span>;
    },
    id: "actions",
    cell: ({ row }) => {
      // const isAdmin = row.original.role;
      return <UserActionCell row={row} />;
      // return (
      //   isAdmin === "SUPER_ADMIN" ||
      //   (isAdmin === "ADMIN" && <UserActionCell row={row} />)
      // );
    },
    enableSorting: false,
  },
];
