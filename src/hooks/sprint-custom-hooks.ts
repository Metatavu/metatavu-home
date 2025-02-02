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
   * Filters the given resource allocations based on the specified filter type and search query.
   *
   * @param allocation - An array of resource allocations to be filtered.
   * 
   * @returns An array of resource allocations that match the filter criteria.
   */
  const filterAllocations = (allocation: ResourceAllocations[]) => {
    return allocation.filter((allocation) =>
      filterType === "project"
        ? allocation.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        : allocation.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

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