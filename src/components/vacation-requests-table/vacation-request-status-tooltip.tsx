import { Box } from "@mui/material";
import { useAtomValue } from "jotai";
import { usersAtom } from "src/atoms/user";
import type { VacationRequestStatus } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import LocalizationUtils from "src/utils/localization-utils";

/**
 * Component properties
 */
interface Props {
  statuses: VacationRequestStatus[];
}

/**
 * Status Tooltip Content Component
 * Displays statuses, created by and timestamps
 *
 * @param props component properties
 */
const StatusToolTipContent = ({ statuses }: Props) => {
  const users = useAtomValue(usersAtom) || [];

  if (statuses.length === 0) {
    return <Box sx={{ p: 1, fontSize: "0.875rem" }}>{strings.vacationRequest.noStatus}</Box>;
  }

  return (
    <Box sx={{ p: 0.5, minWidth: 250 }}>
      <Box
        sx={{
          fontWeight: 600,
          mb: 1,
          pb: 0.5,
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          fontSize: "0.875rem"
        }}
      >
        {strings.vacationRequest.status}
      </Box>

      {statuses.map((statusItem, index) => {
        const admin = users.find((u) => u.id === statusItem.createdBy);
        const firstName = admin?.firstName || "";
        const lastName = admin?.lastName || "";
        const adminName = `${firstName} ${lastName}`.trim() || admin?.email || "Unknown";

        const date = statusItem.updatedAt
          ? new Date(statusItem.updatedAt).toLocaleString()
          : "Unknown";

        const uniqueKey = `${statusItem.status}-${statusItem.createdBy}-${statusItem.updatedAt?.toString() || index}`;

        return (
          <Box
            key={uniqueKey}
            sx={{
              py: 0.5,
              borderBottom: index < statuses.length - 1 ? "1px solid rgba(255,255,255,0.2)" : "none"
            }}
          >
            <Box
              sx={{
                fontWeight: 600,
                color: "#ffd700",
                fontSize: "0.875rem"
              }}
            >
              {LocalizationUtils.getLocalizedVacationRequestStatus(statusItem.status)}
            </Box>
            <Box sx={{ color: "#90cafd", fontSize: "0.8rem", mt: 0.25 }}>
              {strings.vacationRequest.reviewedBy} {adminName}
            </Box>
            <Box sx={{ color: "#bbb", fontSize: "0.75rem", mt: 0.25 }}>{date}</Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default StatusToolTipContent;
