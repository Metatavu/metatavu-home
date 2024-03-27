import { Button, Card, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import VacationRequestsTable from "../vacation-requests-table/vacation-requests-table";
import {
  VacationRequest,
  VacationRequestStatus,
  VacationRequestStatuses,
  Person
} from "../../generated/client";
import { useApi } from "../../hooks/use-api";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { userProfileAtom } from "../../atoms/auth";
import { errorAtom } from "../../atoms/error";
import { GridRowId } from "@mui/x-data-grid";
import { VacationData } from "../../types";
import strings from "../../localization/strings";
import {
  allVacationRequestsAtom,
  allVacationRequestStatusesAtom,
  vacationRequestsAtom,
  vacationRequestStatusesAtom
} from "../../atoms/vacation";
import UserRoleUtils from "../../utils/user-role-utils";
import { Link } from "react-router-dom";
import { KeyboardReturn } from "@mui/icons-material";
import LocalizationUtils from "../../utils/localization-utils";
import { personsAtom } from "../../atoms/person";
import config from "../../app/config";
import { renderVacationDaysTextForScreen } from "../../utils/vacation-days-utils";

/**
 * Vacation requests screen
 */
const VacationRequestsScreen = () => {
  const adminMode = UserRoleUtils.adminMode();
  const { vacationRequestsApi, vacationRequestStatusApi } = useApi();
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [vacationRequests, setVacationRequests] = useAtom(
    adminMode ? allVacationRequestsAtom : vacationRequestsAtom
  );
  const [latestVacationRequestStatuses, setLatestVacationRequestStatuses] = useAtom(
    adminMode ? allVacationRequestStatusesAtom : vacationRequestStatusesAtom
  );
  const [loading, setLoading] = useState(false);
  const [persons] = useAtom(personsAtom);
  const loggedInPerson = persons.find(
    (person: Person) => person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  );

  /**
   * Fetch vacation request statuses
   */
  const fetchVacationRequestStatuses = async () => {
    if (vacationRequests.length && !latestVacationRequestStatuses.length) {
      try {
        setLoading(true);
        const vacationRequestStatuses: VacationRequestStatus[] = [];

        await Promise.all(
          vacationRequests.map(async (vacationRequest) => {
            let createdStatuses: VacationRequestStatus[] = [];
            if (vacationRequest.id) {
              createdStatuses = await vacationRequestStatusApi.listVacationRequestStatuses({
                id: vacationRequest.id
              });
            }
            createdStatuses.forEach((createdStatus) => {
              vacationRequestStatuses.push(createdStatus);
            });
          })
        );
        await filterLatestVacationRequestStatuses(vacationRequestStatuses);
      } catch (error) {
        setError(`${strings.vacationRequestError.fetchStatusError}, ${error}`);
      }
      setLoading(false);
    }
  };

  useMemo(() => {
    fetchVacationRequestStatuses();
  }, [vacationRequests]);

  /**
   * Filter latest vacation request statuses, so there would be only one status(the latest one) for each request showed on the UI
   */
  const filterLatestVacationRequestStatuses = async (
    vacationRequestStatuses: VacationRequestStatus[]
  ) => {
    if (vacationRequests.length && vacationRequestStatuses.length) {
      const selectedLatestVacationRequestStatuses: VacationRequestStatus[] = [];

      vacationRequests.forEach((vacationRequest) => {
        const selectedVacationRequestStatuses: VacationRequestStatus[] = [];

        vacationRequestStatuses.forEach((vacationRequestStatus) => {
          if (vacationRequest.id === vacationRequestStatus.vacationRequestId) {
            selectedVacationRequestStatuses.push(vacationRequestStatus);
          }
        });

        if (selectedVacationRequestStatuses.length) {
          const latestStatus = selectedVacationRequestStatuses.reduce((a, b) => {
            if (a.updatedAt && b.updatedAt) {
              return a.updatedAt > b.updatedAt ? a : b;
            } else if (a.updatedAt) {
              return a;
            }
            return b;
          });
          selectedLatestVacationRequestStatuses.push(latestStatus);
        }
      });
      setLatestVacationRequestStatuses(selectedLatestVacationRequestStatuses);
      setLoading(false);
    }
  };

  /**
   * Fetch vacation requests
   */
  const fetchVacationsRequests = async () => {
    setLoading(true);
    if (!loggedInPerson) return;

    if (!vacationRequests.length) {
      try {
        let fetchedVacationRequests: VacationRequest[] = [];
        if (adminMode) {
          fetchedVacationRequests = await vacationRequestsApi.listVacationRequests({});
        } else {
          fetchedVacationRequests = await vacationRequestsApi.listVacationRequests({
            personId: loggedInPerson?.keycloakId
          });
        }
        setVacationRequests(fetchedVacationRequests);
      } catch (error) {
        setError(`${strings.vacationRequestError.fetchRequestError}, ${error}`);
      }
      setLoading(false);
    }
  };

  useMemo(() => {
    fetchVacationsRequests();
  }, [loggedInPerson]);

  /**
   * Delete vacation request status
   *
   * @param selectedRow selected row
   */
  const deleteVacationRequestStatus = async (selectedRow: GridRowId) => {
    if (latestVacationRequestStatuses.length) {
      try {
        setLoading(true);
        const foundVacationRequestStatus = latestVacationRequestStatuses.find(
          (vacationRequestStatus) => vacationRequestStatus.vacationRequestId === selectedRow
        );
        if (foundVacationRequestStatus?.id) {
          await vacationRequestStatusApi.deleteVacationRequestStatus({
            id: foundVacationRequestStatus.id,
            statusId: foundVacationRequestStatus.id
          });
          const filteredVacationRequestStatuses = latestVacationRequestStatuses.filter(
            (vacationRequestStatus) => vacationRequestStatus.id !== foundVacationRequestStatus.id
          );
          setLatestVacationRequestStatuses(filteredVacationRequestStatuses);
        }
      } catch (error) {
        setError(`${strings.vacationRequestError.deleteStatusError}, ${error}`);
      }
      setLoading(false);
    }
  };

  /**
   * Delete vacation requests
   *
   * @param selectedRowIds selected row ids
   */
  const deleteVacationRequests = async (selectedRowIds: GridRowId[]) => {
    if (vacationRequests.length) {
      let updatedVacationRequests: VacationRequest[] = vacationRequests;
      await Promise.all(
        selectedRowIds.map(async (selectedRowId) => {
          try {
            setLoading(true);
            await deleteVacationRequestStatus(selectedRowId);
            await vacationRequestsApi.deleteVacationRequest({
              id: selectedRowId as string
            });
            updatedVacationRequests = updatedVacationRequests.filter(
              (vacationRequest) => vacationRequest.id !== selectedRowId
            );
            setLoading(false);
          } catch (error) {
            setError(`${strings.vacationRequestError.deleteRequestError}, ${error}`);
          }
        })
      );
      setVacationRequests(updatedVacationRequests);
    }
  };

  /**
   * Create a vacation request status
   *
   * @param newStatus new vacation request status
   * @param selectedRowId selected row ids
   */
  const createVacationRequestStatus = async (
    newStatus: VacationRequestStatuses,
    selectedRowId: GridRowId
  ) => {
    if (!loggedInPerson) return;

    try {
      setLoading(true);
      const vacationRequestId = selectedRowId as string;
      const createdVacationRequestStatus =
        await vacationRequestStatusApi.createVacationRequestStatus({
          id: vacationRequestId,
          vacationRequestStatus: {
            vacationRequestId: vacationRequestId,
            status: newStatus,
            message: LocalizationUtils.getLocalizedVacationRequestStatus(newStatus),
            createdAt: new Date(),
            createdBy: loggedInPerson.keycloakId,
            updatedAt: new Date(),
            updatedBy: loggedInPerson.keycloakId
          }
        });
      setLoading(false);
      return createdVacationRequestStatus;
    } catch (error) {
      setError(`${strings.vacationRequestError.createStatusError}, ${error}`);
    }
  };

  /**
   * Create a vacation request
   *
   * @param vacationData vacation data
   */
  const createVacationRequest = async (vacationData: VacationData) => {
    if (!loggedInPerson) return;

    try {
      setLoading(true);
      const createdRequest = await vacationRequestsApi.createVacationRequest({
        vacationRequest: {
          startDate: vacationData.startDate.toJSDate(),
          endDate: vacationData.endDate.toJSDate(),
          type: vacationData.type,
          message: vacationData.message,
          createdAt: new Date(),
          updatedAt: new Date(),
          days: vacationData.days
        }
      });
      setVacationRequests([createdRequest, ...vacationRequests]);
      setLoading(false);
    } catch (error) {
      setError(`${strings.vacationRequestError.createRequestError}, ${error}`);
    }
  };

  /**
   * Update a vacation request
   *
   * @param vacationData vacation request data
   * @param vacationRequestId vacation request id
   */
  const updateVacationRequest = async (vacationData: VacationData, vacationRequestId: string) => {
    if (!loggedInPerson) return;

    try {
      setLoading(true);
      const vacationRequest = vacationRequests.find(
        (vacationRequest) => vacationRequest.id === vacationRequestId
      );
      if (vacationRequest) {
        const updatedRequest = await vacationRequestsApi.updateVacationRequest({
          id: vacationRequestId,
          vacationRequest: {
            ...vacationRequest,
            startDate: vacationData.startDate.toJSDate(),
            endDate: vacationData.endDate.toJSDate(),
            type: vacationData.type,
            message: vacationData.message,
            updatedAt: new Date(),
            days: vacationData.days
          }
        });
        const updatedVacationRequests = vacationRequests.map((vacationRequest) =>
          vacationRequest.id === updatedRequest.id ? updatedRequest : vacationRequest
        );
        setVacationRequests(updatedVacationRequests);
      }
      setLoading(false);
    } catch (error) {
      setError(`${strings.vacationRequestError.updateRequestError}, ${error}`);
    }
  };

  /**
   * Get updated vacation requests statuses
   *
   * @param newStatus vacation request status
   * @param selectedRowIds selected row ids
   * @returns updated vacation request statuses
   */
  const getUpdatedVacationRequestStatuses = async (
    newStatus: VacationRequestStatuses,
    selectedRowIds: GridRowId[]
  ) => {
    const updatedVacationRequestStatuses: VacationRequestStatus[] = [];

    await Promise.all(
      selectedRowIds.map(async (selectedRowId) => {
        const vacationRequestStatus = latestVacationRequestStatuses.find(
          (vacationRequestStatus) => vacationRequestStatus.vacationRequestId === selectedRowId
        );
        try {
          if (vacationRequestStatus?.id) {
            const updatedVacationRequestStatus =
              await vacationRequestStatusApi.updateVacationRequestStatus({
                id: vacationRequestStatus.id,
                statusId: vacationRequestStatus.id,
                vacationRequestStatus: {
                  ...vacationRequestStatus,
                  status: newStatus
                }
              });
            updatedVacationRequestStatuses.push(updatedVacationRequestStatus);
          }
        } catch (error) {
          setError(`${strings.vacationRequestError.updateStatusError}, ${error}`);
        }
      })
    );

    return updatedVacationRequestStatuses;
  };

  /**
   * Get created vacation request statuses
   *
   * @param newStatus vacation request status
   * @param selectedRowIds selected row ids
   * @returns created vacation request statuses
   */
  const getCreatedVacationRequestStatuses = async (
    newStatus: VacationRequestStatuses,
    selectedRowIds: GridRowId[]
  ) => {
    const createdVacationRequestStatuses: VacationRequestStatus[] = [];

    await Promise.all(
      selectedRowIds.map(async (selectedRowId) => {
        const foundVacationRequestStatus = latestVacationRequestStatuses.find(
          (vacationRequestStatus) => vacationRequestStatus.vacationRequestId === selectedRowId
        );
        if (!foundVacationRequestStatus) {
          const createdVacationRequestStatus = await createVacationRequestStatus(
            newStatus,
            selectedRowId
          );
          if (createdVacationRequestStatus) {
            createdVacationRequestStatuses.push(createdVacationRequestStatus);
          }
        }
      })
    );

    return createdVacationRequestStatuses;
  };

  /**
   * Update vacation request statuses
   *
   * @param newStatus vacation request status
   * @param selectedRowIds selected row ids
   */
  const updateVacationRequestStatuses = async (
    newStatus: VacationRequestStatuses,
    selectedRowIds: GridRowId[]
  ) => {
    const updatedVacationRequestStatuses = await getUpdatedVacationRequestStatuses(
      newStatus,
      selectedRowIds
    );
    const createdVacationRequestStatuses = await getCreatedVacationRequestStatuses(
      newStatus,
      selectedRowIds
    );

    const foundVacationRequestStatuses = latestVacationRequestStatuses.map(
      (latestVacationRequestStatus) => {
        const foundUpdatedVacationRequestStatus = updatedVacationRequestStatuses.find(
          (updatedVacationRequestStatus) =>
            updatedVacationRequestStatus.id === latestVacationRequestStatus.id
        );
        if (foundUpdatedVacationRequestStatus) {
          return foundUpdatedVacationRequestStatus;
        }
        return latestVacationRequestStatus;
      }
    );

    const createdAndFoundVacationRequestStatuses = foundVacationRequestStatuses.concat(
      createdVacationRequestStatuses
    );
    setLatestVacationRequestStatuses(createdAndFoundVacationRequestStatuses);
  };

  return (
    <>
      {loggedInPerson && renderVacationDaysTextForScreen(loggedInPerson)}
      <Card sx={{ margin: 0, padding: "10px", width: "100%", height: "100", marginBottom: "16px" }}>
        <VacationRequestsTable
          deleteVacationRequests={deleteVacationRequests}
          createVacationRequest={createVacationRequest}
          updateVacationRequest={updateVacationRequest}
          updateVacationRequestStatuses={updateVacationRequestStatuses}
          loading={loading}
        />
      </Card>
      <Card sx={{ margin: 0, padding: "10px", width: "100%" }}>
        <Link to={adminMode ? "/admin" : "/"} style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={{ padding: "10px", width: "100%" }}>
            <KeyboardReturn sx={{ marginRight: "10px" }} />
            <Typography>{strings.vacationsScreen.back}</Typography>
          </Button>
        </Link>
      </Card>
    </>
  );
};

export default VacationRequestsScreen;
