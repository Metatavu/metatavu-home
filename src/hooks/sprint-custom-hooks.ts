import type { SelectChangeEvent } from "@mui/material";
import { useState } from "react";
import type { ResourceAllocations, ResourceAllocationsProject } from "src/generated/homeLambdasClient";

const useSprintViewHandlers = () => {
  const [filterType, setFilterType] = useState("project");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<ResourceAllocationsProject | null>(null);

  /**
   * Handles the change event for the filter selection.
   * 
   * @param event - The event triggered by the filter selection change.
   */
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilterType(event.target.value);
    setSearchQuery("");
    setSelectedProject(null);
  };

  /**
   * Handles the click event on a row in the resource allocations table.
   * 
   * @param row - type of ResourceAllocations.
   */
  const handleRowClick = (row: ResourceAllocations) => {
    if (filterType === "project") {
      setSearchQuery(row.project?.name || "");
      setSelectedProject(row.project || null);
    } else if (filterType === "user") {
      setSearchQuery(row.user?.name || "");
      setSelectedProject(row.project || null);
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

    const newAllocationWithProjectDuplication = Array.from(allocationsWithPhaseDuplication.values());

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
    filterAllocations,
  };
};

export default useSprintViewHandlers;