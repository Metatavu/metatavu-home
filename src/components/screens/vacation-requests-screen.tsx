import { Button, Card, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import VacationRequestsTable from "../vacation-requests-table/vacation-requests-table";
import {
  VacationRequest, VacationRequestStatuses,
} from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import type { GridRowId } from "@mui/x-data-grid";
import type { VacationData } from "src/types";
import strings from "src/localization/strings";
import {
  allVacationRequestsAtom,
  vacationRequestsAtom,
  displayedVacationRequestsAtom
} from "src/atoms/vacation";
import UserRoleUtils from "src/utils/user-role-utils";
import { Link } from "react-router-dom";
import { KeyboardReturn } from "@mui/icons-material";
import { renderVacationDaysTextForScreen } from "src/utils/vacation-days-utils";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";

/**
 * Vacation requests screen
 */
const VacationRequestsScreen = () => {
  const adminMode = UserRoleUtils.adminMode();
  const { vacationRequestsApi } = useLambdasApi();
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [vacationRequests, setVacationRequests] = useAtom(
    adminMode ? allVacationRequestsAtom : vacationRequestsAtom
  );
  const setDisplayedVacationRequests = useSetAtom(displayedVacationRequestsAtom);

  const upcomingVacationRequests = useMemo(
    () => vacationRequests.filter((request) => request.endDate.getTime() > Date.now()),
    [vacationRequests]
  );
  const pastVacationRequests = useMemo(
    () => vacationRequests.filter((request) => request.endDate.getTime() <= Date.now()),
    [vacationRequests]
  );

  const [loading, setLoading] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(true);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find(
    (user: User) =>
      user.id === userProfile?.id
  );

  /**
   * Decide if we show upcoming or past vacations
   */
  useEffect(() => {
    isUpcoming
      ? setDisplayedVacationRequests(upcomingVacationRequests)
      : setDisplayedVacationRequests(pastVacationRequests);
  }, [isUpcoming, vacationRequests]);

    /**
   * Handler for upcoming/ past vacations toggle click
   */
  const toggleIsUpcoming = () => {
    setIsUpcoming(!isUpcoming);
  };

  /**
   * Fetch vacation requests
   */
  const fetchVacationsRequests = async () => {
    setLoading(true);
    if (!loggedInUser) return;

    if (!vacationRequests.length) {
      try {
        let fetchedVacationRequests: VacationRequest[] = [];
        if (adminMode) {
          fetchedVacationRequests = await vacationRequestsApi.listVacationRequests({});
        } else {
          fetchedVacationRequests = await vacationRequestsApi.listVacationRequests({
            userId: loggedInUser?.id
          });
        }
        setVacationRequests(fetchedVacationRequests);
      } catch (error) {
        setError(`${strings.vacationRequestError.fetchRequestError}, ${error}`);
      }
    }
    setLoading(false);
  };

  useMemo(() => {
    fetchVacationsRequests();
  }, [loggedInUser]);

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
            await vacationRequestsApi.deleteVacationRequest({
              id: selectedRowId as string
            });
            updatedVacationRequests = updatedVacationRequests.filter(
              (vacationRequest) => vacationRequest.id !== selectedRowId
            );
          } catch (error) {
            setError(`${strings.vacationRequestError.deleteRequestError}, ${error}`);
          }
          setLoading(false);
        })
      );
      setVacationRequests(updatedVacationRequests);
    }
  };

  /**
   * Create a vacation request
   *
   * @param vacationData vacation data
   */
  const createVacationRequest = async (vacationData: VacationData) => {
    if (!loggedInUser) return;
    try {
      setLoading(true);
      const createdRequest = await vacationRequestsApi.createVacationRequest({
        vacationRequest: {
          userId: loggedInUser.id,
          startDate: vacationData.startDate.toJSDate(),
          endDate: vacationData.endDate.toJSDate(),
          type: vacationData.type,
          message: vacationData.message,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: loggedInUser?.id,
          days: vacationData.days,
          draft: false,
          status: [
            {
              message: vacationData.message,
              createdBy: loggedInUser.id,
              updatedAt: new Date(),
              status: VacationRequestStatuses.PENDING,
            }
          ],
        }
      });
      setVacationRequests([createdRequest, ...vacationRequests]);
    } catch (error) {
      setError(`${strings.vacationRequestError.createRequestError}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Update a vacation request
   *
   * @param vacationData vacation request data
   * @param vacationRequestId vacation request id
   */
  const updateVacationRequest = async (vacationData: VacationData, vacationRequestId: string) => {
    if (!loggedInUser) return;

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
            days: vacationData.days,
            status: vacationData.status
          }
        });
        const updatedVacationRequests = vacationRequests.map((vacationRequest) =>
          vacationRequest.id === updatedRequest.id ? updatedRequest : vacationRequest
        );
        setVacationRequests(updatedVacationRequests);
      }
    } catch (error) {
      setError(`${strings.vacationRequestError.updateRequestError}, ${error}`);
    }
    setLoading(false);
  };

  return (
    <>
      {loggedInUser && renderVacationDaysTextForScreen(loggedInUser)}
      <Card sx={{ margin: 0, padding: "10px", width: "100%", height: "100", marginBottom: "16px" }}>
        <VacationRequestsTable
          isUpcoming={isUpcoming}
          toggleIsUpcoming={toggleIsUpcoming}
          deleteVacationRequests={deleteVacationRequests}
          createVacationRequest={createVacationRequest}
          updateVacationRequest={updateVacationRequest}
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
