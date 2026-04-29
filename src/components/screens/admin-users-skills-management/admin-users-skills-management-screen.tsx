import { Box, Container, Typography } from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { userProfileAtom } from "src/atoms/auth.ts";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { usersSkillsAtom } from "src/atoms/usersSkills.ts";
import BackButton from "src/components/generics/back-button.tsx";
import EditUsersSkillsDialog from "src/components/screens/admin-users-skills-management/EditUsersSkillsDialog.tsx";
import UsersSkillsSearchBar from "src/components/screens/admin-users-skills-management/UsersSkillsSearchBar.tsx";
import UsersSkillsTable from "src/components/screens/admin-users-skills-management/UsersSkillsTable.tsx";
import type { Skill, UsersSkills } from "src/generated/homeLambdasClient";
import { User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { saveSkills } from "src/utils/users-skills-utils";

/**
 * AdminUsersSkillsManagementScreen Component
 *
 * Administrative UI for managing and viewing information of employees' skills.
 *
 * Features:
 * - View users skills
 * - Search users by name or skill
 * - Edit users skills (add, modify, remove individual skills)
 *
 * @returns React component for admin users skills management
 */
const AdminUsersSkillsManagementSkills = () => {
  const { usersSkillsApi } = useLambdasApi();
  const [usersSkills, setUsersSkills] = useAtom(usersSkillsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { usersApi } = useLambdasApi();
  const [users, setUsers] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const [loading, setLoading] = useState(false);
  const [setLoadingUsers] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUsersSkills, setCurrentUsersSkills] = useState<UsersSkills | null>(null);
  const [editedSkills, setEditedSkills] = useState<Skill[]>([]);
  const [saving, setSaving] = useState(false);

  /**
   * Fetches all users' skills from the API on component mount.
   */
  const fetchUsersSkills = async () => {
    if (!loggedInUser) return;
    setLoading(true);
    try {
      const fetchedUsersSkills = await usersSkillsApi.listUsersSkills();
      setUsersSkills(fetchedUsersSkills);
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.usersSkillsError.fetchUsersSkillsError}: ${errorMessage?.message || error}`
      );
    }
    setLoading(false);
  };

  /**
   * Fetches all users from the keycloak if now already available in the atom
   */
  const fetchUsers = async () => {
    if (users.length > 0) {
      return;
    }

    try {
      setLoadingUsers(true);
      const fetchedUsers = await usersApi.listUsers();
      setUsers(fetchedUsers);
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(`${strings.vacationRequestError.failedToLoad}: ${errorMessage?.message || error}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  /**
   * Checks all users against existing usersSkills entries.
   * Creates a new empty UsersSkills entry for any user that does not have one.
   *
   * @param allUsers - Full list of users from keycloak.
   * @param allUsersSkills - Full list of existing usersSkills entries.
   */
  const syncUsersSkills = async (allUsers: User[], allUsersSkills: UsersSkills[]) => {
    const existingIds = new Set(allUsersSkills.map((entry) => entry.id));

    const usersWithoutSkills = allUsers.filter((user) => {
      const hasSkills = existingIds.has(user.id);
      const hasName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim().length > 0;
      return !hasSkills && hasName;
    });

    for (const user of usersWithoutSkills) {
      try {
        const created = await usersSkillsApi.createUsersSkills({
          usersSkills: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            skills: []
          }
        });
        setUsersSkills((prev) => {
          const alreadyExists = prev.some((e) => e.id === created.id);
          if (alreadyExists) return prev;
          return [...prev, created];
        });
      } catch (error: any) {
        const errorMessage = await error?.response?.json();
        setError(
          `${strings.usersSkillsError.createUsersSkillsError}: ${errorMessage?.message || error}`
        );
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUsers();
      await fetchUsersSkills();

      syncUsersSkills(users, usersSkills);
    };
    init();
  }, [loggedInUser]);

  /**
   * Opens the edit dialog for a specific user's skills,
   * copying their current skills into local state.
   *
   * @param entry - The UsersSkills entry to edit.
   */
  const handleEditUsersSkills = (entry: UsersSkills) => {
    setCurrentUsersSkills(entry);
    setEditedSkills(entry.skills ? [...entry.skills] : []);
    setEditDialogOpen(true);
  };

  /**
   * Closes the edit dialog and resets local state.
   */
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setCurrentUsersSkills(null);
    setEditedSkills([]);
    setSaving(false);
  };

  /**
   * Updates a single field of a skill at the given index.
   *
   * @param index - Index of the skill in the editedSkills array.
   * @param field - The skill field to update (name, category, months).
   * @param value - The new value.
   */
  const handleSkillChange = (index: number, field: keyof Skill, value: string | number): void => {
    setEditedSkills((prev) =>
      prev.map((skill, i) => (i === index ? { ...skill, [field]: value } : skill))
    );
  };

  /**
   * Adds a new empty skill to the editedSkills list.
   */
  const handleSkillAdd = async () => {
    const newSkills = [...editedSkills, { name: "", category: "", months: 0 }];
    setEditedSkills(newSkills);
    setCurrentUsersSkills((prev) => (prev ? { ...prev, skills: newSkills } : prev));
    await saveSkills(
      usersSkillsApi,
      currentUsersSkills!,
      newSkills,
      setUsersSkills,
      setSaving,
      setError,
      strings.usersSkillsError.updateUsersSkillsError
    );
  };

  /**
   * Removes a skill at the given index from the editedSkills list.
   *
   * @param index - Index of the skill to remove.
   */
  const handleSkillRemove = async (index: number) => {
    const newSkills = editedSkills.filter((_, i) => i !== index);
    setEditedSkills(newSkills);
    setCurrentUsersSkills((prev) => (prev ? { ...prev, skills: newSkills } : prev));
    await saveSkills(
      usersSkillsApi,
      currentUsersSkills!,
      newSkills,
      setUsersSkills,
      setSaving,
      setError,
      strings.usersSkillsError.updateUsersSkillsError
    );
  };

  /**
   * Saves the edited skills for the current user via the API
   * and updates the global usersSkills list.
   */
  const handleSaveSkills = async () => {
    await saveSkills(
      usersSkillsApi,
      currentUsersSkills!,
      editedSkills,
      setUsersSkills,
      setSaving,
      setError,
      strings.usersSkillsError.updateUsersSkillsError
    );
    handleCloseDialog();
  };

  /**
   * Deletes a UsersSkills entry via the API and removes it from the atom.
   *
   * @param entry - The UsersSkills entry to delete.
   */
  const handleDeleteUsersSkills = async (entry: UsersSkills) => {
    if (!entry.id) return;
    try {
      await usersSkillsApi.deleteUsersSkills({ id: entry.id });
      setUsersSkills((prev) => prev.filter((e) => e.id !== entry.id));
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.usersSkillsError.deleteUsersSkillsError}: ${errorMessage?.message || error}`
      );
    }
  };

  /**
   * Filters users skills based on search keyword.
   * Matches against user's name or their skill names.
   * - Skill-name matches are sorted by months of experience (descending).
   * - Name matches are sorted by total skill experience (descending).
   * Case-insensitive, trims unnecessary whitespace.
   *
   * @returns Array of UsersSkills matching the search criteria.
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
      <UsersSkillsTable
        usersSkills={filteredUsersSkills}
        loading={loading}
        onEdit={handleEditUsersSkills}
        onDelete={handleDeleteUsersSkills}
      />
      <BackButton styles={{ mt: 3, marginBottom: 2 }} />
      <EditUsersSkillsDialog
        open={editDialogOpen}
        usersSkills={currentUsersSkills}
        skills={editedSkills}
        loading={saving}
        onClose={handleCloseDialog}
        onSkillChange={handleSkillChange}
        onSkillAdd={handleSkillAdd}
        onSkillRemove={handleSkillRemove}
        onSave={handleSaveSkills}
        disableSave={saving}
      />
    </Container>
  );
};

export default AdminUsersSkillsManagementSkills;
