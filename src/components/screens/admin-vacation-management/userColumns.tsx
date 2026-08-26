import { Edit } from "@mui/icons-material";
import type { GridColDef } from "@mui/x-data-grid";
import AppIconButton from "src/components/generics/buttons/app-icon-button";
import strings from "../../../localization/strings";

/**
 * Creates the column definitions for the vacation management table.
 *
 * The table displays the user's name, email address, total vacation days
 * for the current year, remaining vacation days, and an action button
 * for editing the selected user's vacation days.
 *
 * @param handleEditUser - Callback invoked when the edit button is clicked.
 * @returns An array of column definitions for the vacation management table.
 */
const getUserTableColumns = (handleEditUser: () => void) => {
  const userColumns: GridColDef[] = [
    {
      field: "name",
      headerName: strings.userTable.name,
      flex: 1,
      width: 250,
      editable: false
    },
    {
      field: "email",
      headerName: strings.userTable.email,
      flex: 1,
      width: 250,
      editable: false
    },
    {
      field: "total",
      headerName: strings.userTable.currentYearTotal,
      flex: 1,
      width: 100,
      editable: false
    },
    {
      field: "remaining",
      headerName: strings.userTable.remainingDays,
      flex: 1,
      width: 100,
      editable: false
    },
    {
      field: "actions",
      headerName: strings.userTable.actions,
      flex: 1,
      maxWidth: 100,
      editable: false,
      renderCell: () => <AppIconButton variant="small" icon={<Edit />} onClick={handleEditUser} />
    }
  ];

  return userColumns;
};

export default getUserTableColumns;
