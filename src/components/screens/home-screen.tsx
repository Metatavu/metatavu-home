import { Grid, Skeleton } from "@mui/material";
import BalanceCard from "../home/balance-card";
import VacationsCard from "../home/vacations-card";
import SprintViewCard from "../home/sprint-view-card";
import type { User } from "src/generated/homeLambdasClient";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";
import { useAtomValue } from "jotai";
import strings from "src/localization/strings";
import type { ReactNode } from "react";
import QuestionnaireProgress from "src/components/home/questionnaire-progress";
import { useNavigate } from "react-router-dom";
import UserRoleUtils from "src/utils/user-role-utils";

/**
 * Home screen component
 */
const HomeScreen = () => {
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const hasSeveraUserId = !!loggedInUser?.attributes?.severaUserId;
  const navigate = useNavigate();
  const adminMode = UserRoleUtils.adminMode();
  
  /**
   * Renders a card with a skeleton loader
   *
   * @param title - Title of the card
   * @param content - Content to render inside the card
   * @returns ReactNode containing the card
   */
  const renderCardWithSkeleton = (title: string, content: ReactNode) => (
    <Grid
      sx={{
        background: "#f5f5f5",
        borderRadius: 1,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        marginBottom: 2,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"
      }}
    >
      <Grid sx={{ padding: 2 }}>
        <Grid sx={{ fontWeight: "bold", fontSize: 22 }}>
          {title}
        </Grid>
        {!hasSeveraUserId ? (
          <>
            <div style={{ color: "#888", fontSize: 15, padding: "12px 0" }}>
              {strings.notOptedInDescription.description}
            </div>
            <Skeleton variant="rectangular" height={20} sx={{ borderRadius: 1, marginTop: 1, width: "100%" }} />
          </>
        ) : (
          content
        )}
      </Grid>
    </Grid>
  );

  /**
   * Renders the questionnaire card
   * 
   * @returns ReactNode containing the questionnaire card
   */
  const renderQuestionnaireCard = () => (
    <Grid
      sx={{
        background: "#f5f5f5",
        borderRadius: 1,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        marginBottom: 2,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)"
        }
      }}
      onClick={() => navigate(adminMode ? "/admin/questionnaire" : "/questionnaire")}
    >
      <Grid sx={{ padding: 2 }}>
        <QuestionnaireProgress />
      </Grid>
    </Grid>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        {renderCardWithSkeleton(
          strings.balanceCard.balance,
          <BalanceCard />
        )}
        <Grid item xs={12} style={{ marginTop: "16px" }}>
          {renderCardWithSkeleton(
            strings.sprint.sprintview,
            <SprintViewCard />
          )}
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <VacationsCard />
      </Grid>
      <Grid item xs={12} sm={6}>
        {renderQuestionnaireCard()}
      </Grid>
    </Grid>
  );
};

export default HomeScreen;