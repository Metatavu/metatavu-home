import type { SelectChangeEvent } from "@mui/material";
import { useState } from "react";
import type { ResourceAllocations, ResourceAllocationsProject } from "src/generated/homeLambdasClient";

const useSprintViewHandlers = () => {
  const [filterType, setFilterType] = useState("project");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<ResourceAllocationsProject | null>(null);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilterType(event.target.value);
    setSearchQuery("");
    setSelectedProject(null);
  };

  const handleRowClick = (row: ResourceAllocations) => {
    if (filterType === "project") {
      setSearchQuery(row.project?.name || "");
      setSelectedProject(row.project || null);
    } else if (filterType === "user") {
      setSearchQuery(row.user?.name || "");
      setSelectedProject(row.project || null);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedProject(null);
  };

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