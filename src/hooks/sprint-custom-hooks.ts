import type { SelectChangeEvent } from "@mui/material";
import { useState } from "react";
import type {
  ResourceAllocations,
  ResourceAllocationsProject
} from "src/generated/homeLambdasClient";
import { type SprintViewFilterType, SprintViewFilterTypes } from "../types";

/**
 * Custom hook to handle sprint view interactions.
 *
 * @returns An object containing state variables and handler functions for sprint view interactions.
 */
const useSprintViewHandlers = () => {
  const [filterType, setFilterType] = useState<SprintViewFilterType>(SprintViewFilterTypes.clear);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<ResourceAllocationsProject | null>(null);

  /**
   * Handles the change event for the filter selection.
   *
   * @param event - The event triggered by the filter selection change.
   */
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilterType(event.target.value as SprintViewFilterType);
    setSearchQuery("");
    setSelectedProject(null);
  };

  /**
   * Handles the click event on a row in the resource allocations table.
   *
   * @param row - type of ResourceAllocations.
   */
  const handleRowClick = (row: ResourceAllocations) => {
    const clickedProject = row.project || null;

    // Toggle selection
    if (selectedProject?.severaProjectId === clickedProject?.severaProjectId) {
      setSelectedProject(null);
      setSearchQuery("");
    } else {
      setSelectedProject(clickedProject);

      if (filterType === SprintViewFilterTypes.project) {
        setSearchQuery(clickedProject?.name || "");
      } else if (filterType === SprintViewFilterTypes.user) {
        setSearchQuery(row.user?.name || "");
      }
    }
  };

  /**
   * Clears the search query and resets the selected project.
   *
   * @returns {void}
   */
  const handleClearSearch = (): void => {
    setSearchQuery("");
    setSelectedProject(null);
  };

  /**
   * Filters the total allocations preventing duplication for phase and assignee.
   *
   * @param allocation - total allocations to be filtered.
   *
   * @returns An array of resource allocations that match the filter criteria.
   */
  const filterAllocations = (allocations: ResourceAllocations[], isAdmin: boolean) => {
    const allocationsWithPhaseDuplication = new Map<string, ResourceAllocations>();

    allocations.forEach((allocation) => {
      const key = isAdmin
        ? `${allocation.project?.name}-${allocation.user?.name}`
        : allocation.project?.name;

      if (key?.toLowerCase().includes(searchQuery.toLowerCase())) {
        allocationsWithPhaseDuplication.set(key, allocation);
      }
    });

    const newAllocationWithProjectDuplication = Array.from(
      allocationsWithPhaseDuplication.values()
    );

    const uniqueAllocations = newAllocationWithProjectDuplication.reduce((acc, allocation) => {
      const projectId = allocation.project?.severaProjectId;

      if (projectId && !acc.some((a) => a.project?.severaProjectId === projectId)) {
        acc.push(allocation);
      }

      return acc;
    }, [] as ResourceAllocations[]);

    return uniqueAllocations;
  };

  return {
    filterType,
    searchQuery,
    selectedProject,
    handleFilterChange,
    handleRowClick,
    handleClearSearch,
    setSearchQuery,
    setSelectedProject,
    filterAllocations
  };
};

export default useSprintViewHandlers;
