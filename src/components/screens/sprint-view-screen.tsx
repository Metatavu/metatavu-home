import React, { useState, useEffect, useMemo } from 'react';
import strings from "../../localization/strings";
import { Card, IconButton } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useLambdasApi } from "../../hooks/use-api";
import { Person } from "../../generated/client";
import { useAtomValue } from "jotai";
import { personsAtom } from "../../atoms/person";
import config from "../../app/config";
import { userProfileAtom } from "../../atoms/auth";
import { Allocations } from "../../generated/homeLambdasClient/models/Allocations";
import { Projects } from "../../generated/homeLambdasClient/models/Projects";
import { Tasks } from "../../generated/homeLambdasClient/models/Tasks";
import { TimeEntries } from "../../generated/homeLambdasClient/models/TimeEntries";
import { DataGrid } from '@mui/x-data-grid';

const SprintViewScreen = () => {
  const { allocationsApi, projectsApi, tasksApi, timeEntriesApi } = useLambdasApi();
  const persons: Person[] = useAtomValue(personsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInPerson = persons.find(
    (person: Person) => person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  );
  
  const [allocations, setAllocations] = useState<Allocations[]>([]);
  const [projects, setProjects] = useState<Projects[]>([]);
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntries[]>([]);
  const [minimizedProjects, setMinimizedProjects] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch person allocations
        const allocationsData = await getPersonAllocations();
        setAllocations(allocationsData);
        
        // Fetch projects
        const projectsData = await getProjects();
        setProjects(projectsData);
        
        // Fetch tasks
        const tasksData = await getTasks();
        setTasks(tasksData);
        
        // Fetch time entries
        const timeEntriesData = await getTimeEntries();
        setTimeEntries(timeEntriesData);
        //allocations.forEach(row => calculateTotalHours(row));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [loggedInPerson]);

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    return [];
  };

  const getProjects = async () => {
    if (!loggedInPerson) return [];

    try {
      const fetchedAllocations = await allocationsApi.listAllocations({ startDate: new Date() });
      const filteredAllocations = fetchedAllocations.filter(allocation => allocation.person === loggedInPerson.id);

      const fetchedProjects = await Promise.all(filteredAllocations.map(async (allocation) => {
        try {
          const fetchedProjects = await projectsApi.listProjects({ startDate: new Date() });
          return fetchedProjects.filter(project => project.id === allocation.project);
        } catch (error) {
          return handleError(error, 'Error fetching time entries for project:');
        }
      }));

      const mergedProjects = fetchedProjects.flatMap(project => project);
      setProjects(prevState => [...prevState, ...mergedProjects]);
      return mergedProjects;
    } catch (error) {
      return handleError(error, "Error fetching projects:");
    }
  };

  const getPersonAllocations = async () => {
    if (!loggedInPerson) return [];
  
    try {
      const fetchedAllocations = await allocationsApi.listAllocations({
        startDate: new Date(),
      });
  
      const filteredAllocations = fetchedAllocations.filter(allocation => allocation.person === loggedInPerson.id);
      return filteredAllocations;
    } catch (error) {
      console.error("Error fetching allocations:", error);
      return []; // Ensure that an empty array is returned in case of an error
    }
  };

  const getTasks = async () => {
    if (!loggedInPerson) return [];
  
    try {
      const fetchedTasks = await tasksApi.listProjectTasks({
        projectId: 0
      });
  
      return fetchedTasks.filter(task => task.assignedPersons.includes(loggedInPerson.id));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  };

  const getTimeEntries = async () => {
    if (!loggedInPerson) return [];
  
    try {
      const fetchedAllocations = await allocationsApi.listAllocations({ startDate: new Date() });
      const filteredAllocations = fetchedAllocations.filter(allocation => allocation.person === loggedInPerson.id);
  
      const fetchedTimeEntries = await Promise.all(filteredAllocations.map(async (allocation) => {
        try {
          const fetchedTimeEntries = await timeEntriesApi.listProjectTimeEntries({ projectId: allocation.project });
          return fetchedTimeEntries;
        } catch (error) {
          throw new Error(`Error fetching time entries for allocation ${allocation.id}: ${error}`);
        }
      }));
  
      const mergedEntries = fetchedTimeEntries.flatMap(entries => entries);
      return mergedEntries;
    } catch (error) {
      throw new Error(`Error fetching time entries: ${error}`);
    }
  };

  

  const toggleMinimizeProject = (projectId: number) => {
    setMinimizedProjects(prevMinimizedProjects =>
      prevMinimizedProjects.includes(projectId)
        ? prevMinimizedProjects.filter(id => id !== projectId)
        : [...prevMinimizedProjects, projectId]
    );
  };

  const calculateTotalHours = useMemo(() => (allocation: Allocations, estimate: number) => {
    const totalMinutes =
      (allocation.monday || 0) + 
      (allocation.tuesday || 0) + 
      (allocation.wednesday || 0) + 
      (allocation.thursday || 0) + 
      (allocation.friday || 0);
  
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    const relevantTimeEntries = timeEntries.filter(entry => entry.project === allocation.project);
    const timeRegistered = relevantTimeEntries.reduce((total, entry) => total + entry.timeRegistered, 0);
  
    const allocationsLeft = totalMinutes - timeRegistered;
    const leftHours = Math.floor(allocationsLeft / 60);
    const leftMinutes = allocationsLeft % 60;
  
    const estimateHours = Math.floor(estimate / 60);
    const estimateMinutes = estimate % 60;
  
    return {
      total: `${hours}h ${minutes}min`,
      timeEntries: `${Math.floor(timeRegistered / 60)}h ${timeRegistered % 60}min`,
      allocationsLeft: `${leftHours}h ${leftMinutes}min`,
      estimate: `${estimateHours}h ${estimateMinutes}min`
    };
  }, [timeEntries]);

  const filteredTasks = (projectId: number) => {
    return tasks.filter((task) => task.projectId === projectId);
  };

  return (
    <>
      <h1>{strings.sprint.sprintviewScreen}</h1>
  
      <Card sx={{ margin: 0, padding: "10px", width: "100%", height: "100", marginBottom: "16px" }}>
        <DataGrid
          rows={allocations}
          columns={[
            { field: 'projectName', headerName: 'My allocations', flex: 2, valueGetter: (params) => projects.find(project => project.id === params.row.project)?.name },
            { field: 'allocation', headerName: 'Allocation', flex: 1, valueGetter: (params) => calculateTotalHours(params.row).total },
            { field: 'timeEntries', headerName: 'Time Entries', flex: 1, valueGetter: (params) => calculateTotalHours(params.row).timeEntries },
            { field: 'allocationsLeft', headerName: 'Allocations Left', flex: 1, valueGetter: (params) => calculateTotalHours(params.row).allocationsLeft },
          ]}
        />
      </Card>
  
      {projects.map((project) => (
        <Card key={project.id} sx={{ margin: 0, padding: "10px", width: "100%", height: "100", marginBottom: "16px" }}>
          <IconButton onClick={() => toggleMinimizeProject(project.id)}>
            {minimizedProjects.includes(project.id) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          <span>{project.name}</span>
          {minimizedProjects.includes(project.id) && (
            <DataGrid
              rows={filteredTasks(project.id).map(task => ({
                id: task.id,
                title: task.title,
                assignedPersons: task.assignedPersons ? task.assignedPersons.join(', ') : '-',
                status: project.status,
                priority: task.highPriority ? 'High' : 'Normal',
                estimate: calculateTotalHours(task, task.estimate).estimate,
                timeEntries: (() => {
                  const totalMinutes = timeEntries
                    .filter(entry => entry.task === task.id)
                    .map(entry => entry.timeRegistered)
                    .reduce((total, time) => total + time, 0);

                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;

                  return `${hours}h ${minutes}min`;
                })(),
              }))}
              columns={[
                { field: 'title', headerName: project.name, flex: 3 },
                { field: 'assignedPersons', headerName: 'Assignees', flex: 1 },
                { field: 'status', headerName: 'Status', flex: 1 },
                { field: 'priority', headerName: 'Priority', flex: 1 },
                { field: 'estimate', headerName: 'Estimate', flex: 1 },
                { field: 'timeEntries', headerName: 'Time Entries', flex: 1 },
              ]}
            />
          )}
        </Card>
      ))}
    </>
  );
};

export default SprintViewScreen;
