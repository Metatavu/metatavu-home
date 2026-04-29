import {
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { userProfileAtom } from "src/atoms/auth.ts";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { displayedUsersSkillsAtom, usersSkillsAtom } from "src/atoms/usersSkills.ts";
import BackButton from "src/components/generics/back-button.tsx";
import UsersSkillsSearchBar from "src/components/screens/admin-users-skills-management/UsersSkillsSearchBar.tsx";
import UsersSkillsTable from "src/components/screens/admin-users-skills-management/UsersSkillsTable.tsx";
import EditVacationDialog from "src/components/screens/admin-vacation-management/EditVacationDialog.tsx";
import UserTable from "src/components/screens/admin-vacation-management/UsersTable.tsx";
import { User, UsersSkills, type VacationRequest } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role.ts";
import strings from "src/localization/strings";
import type { FilterType } from "src/utils/vacation-filter-type.tsx";

const PAGINATION_THRESHOLD = 20;
const DEFAULT_ROWS_PER_PAGE = 20;

/**
 * AdmindUsersSkillsManagementScreen Component
 *
 * Administrative UI for managing and viewing information of employees` skills.
 *
 * Features:
 * - View users skills
 * - Search users by name or email
 * - Filter users by skills
 * - Edit users skills
 *
 * @returns React component for admin users skills management
 */
const AdminUsersSkillsManagementSkills = () => {
  // const { adminMode } = useUserRole();
  const { usersSkillsApi } = useLambdasApi();
  const [usersSkills, setUsersSkills] = useAtom(usersSkillsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [users, setUsers] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(location.search);
  const selectedId = params.get("selectedId");
  const setDisplayedUsersSkills = useSetAtom(displayedUsersSkillsAtom);

  /**
   * Create a vacation request
   *
   * @param vacationRequestData vacation data from the create form
   */
  const createUsersSkills = async () => {
    if (!loggedInUser) return;
    try {
      setLoading(true);
      const newId = "12345678123";
      const createdUsersSkills = await usersSkillsApi.createUsersSkills({
        usersSkills: {
          id: newId,
          name: "Stepan",
          skills: [
            {
              name: "TypeScript",
              category: "Programming",
              months: 10
            },
            {
              name: "Python",
              category: "Programming",
              months: 12
            },
            {
              name: "C++",
              category: "Programming",
              months: 24
            },
            {
              name: "Guitar",
              category: "Hobby",
              months: 22
            }
          ]
        }
      });
      setUsersSkills([createdUsersSkills, ...usersSkills]);
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.vacationRequestError.createRequestError}: ${errorMessage?.message || error}`
      );
    }
    setLoading(false);
  };

  /**
   * Fetch users skills
   */
  const fetchUsersSkills = async () => {
    if (!loggedInUser) return;
    setLoading(true);
    try {
      const fetchedUsersSkills = await usersSkillsApi.listUsersSkills({});
      setUsersSkills(fetchedUsersSkills);
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.usersSkillsError.fetchUsersSkillsError}: ${errorMessage?.message || error}`
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      // console.log("Trying to create a users skills");
      // await createUsersSkills();
      await fetchUsersSkills();
    };

    init();
  }, [loggedInUser]);

  /**
   * Filters users based on search keyword.
   * Matches against user's full name (first + last) or their skills.
   * Case-insensitive search and trims unnecessary whitespace.
   *
   * @returns Array of users matching the search criteria
   */
  const filteredUsersSkills = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    if (!keyword) return usersSkills;

    const filtered = usersSkills.filter((user) => {
      const matchesName = user.name.toLowerCase().includes(keyword);
      const matchesSkill = user.skills?.some((skill) => skill.name.toLowerCase().includes(keyword));
      return matchesName || matchesSkill;
    });

    const isNameSearch = filtered.some((user) => user.name.toLowerCase().includes(keyword));
    const isSkillSearch = filtered.some((user) =>
      user.skills?.some((skill) => skill.name.toLowerCase().includes(keyword))
    );

    if (isSkillSearch && !isNameSearch) {
      return [...filtered].sort((a, b) => {
        const monthsA =
          a.skills?.find((skill) => skill.name.toLowerCase().includes(keyword))?.months || 0;
        const monthsB =
          b.skills?.find((skill) => skill.name.toLowerCase().includes(keyword))?.months || 0;
        return monthsB - monthsA;
      });
    }

    if (isNameSearch) {
      return [...filtered].sort((a, b) => {
        const totalA = a.skills?.reduce((sum, skill) => sum + (skill.months || 0), 0) || 0;
        const totalB = b.skills?.reduce((sum, skill) => sum + (skill.months || 0), 0) || 0;
        return totalB - totalA;
      });
    }

    return filtered;
  }, [usersSkills, searchKeyword]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {strings.usersSkills.heading}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <UsersSkillsSearchBar value={searchKeyword} onChange={setSearchKeyword} />
      </Box>
      <UsersSkillsTable usersSkills={filteredUsersSkills} loading={loading} />
      <BackButton styles={{ mt: 3, marginBottom: 2 }} />
    </Container>
  );
};

export default AdminUsersSkillsManagementSkills;
