import type { Skill, UsersSkills, UsersSkillsApi } from "src/generated/homeLambdasClient";

/**
 * Saves the given skills array for a user via the API
 * and updates the global usersSkills atom.
 *
 * @param usersSkillsApi - The API client instance.
 * @param currentUsersSkills - The user entry being updated.
 * @param skills - The updated skills array to save.
 * @param setUsersSkills - Atom setter for the usersSkills list.
 * @param setSaving - State setter for the saving indicator.
 * @param setError - Atom setter for error messages.
 * @param errorMessage - The error string prefix to display on failure.
 */
export const saveSkills = async (
  usersSkillsApi: UsersSkillsApi,
  currentUsersSkills: UsersSkills,
  skills: Skill[],
  setUsersSkills: (updater: (prev: UsersSkills[]) => UsersSkills[]) => void,
  setSaving: (value: boolean) => void,
  setError: (value: string) => void,
  errorMessage: string
): Promise<void> => {
  if (!currentUsersSkills.id) return;
  setSaving(true);
  try {
    const updated = await usersSkillsApi.updateUsersSkills({
      id: currentUsersSkills.id,
      usersSkills: {
        ...currentUsersSkills,
        skills
      }
    });
    setUsersSkills((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
  } catch (error: any) {
    const message = await error?.response?.json();
    setError(`${errorMessage}: ${message?.message || error}`);
  } finally {
    setSaving(false);
  }
};
