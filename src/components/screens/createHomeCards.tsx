import type { Theme } from "@mui/material/styles";
import { type Dispatch, type ReactNode, type SetStateAction, useMemo } from "react";
import type { User } from "src/generated/homeLambdasClient/models/User";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { renderCardWithSkeleton, toggleCard } from "src/utils/cardUtils";
import BalanceCard from "../home/balance-card";
import OnCallCard from "../home/oncall-card";
import QuestionnaireCard from "../home/questionnaire-card";
import ScheduleCard from "../home/scheduleCard/scheduleCard";
import SprintViewCard from "../home/sprint-view-card";
import VacationsCard from "../home/vacations-card";
import WikiDocumentationCard from "../home/wiki-documentation-card";

export type HomepageCardType = {
  id: string;
  element: ReactNode;
  canGroup: boolean;
  group: HomepageCardType | undefined;
};

/**
 * Creates an array of homepage cards based on user role and visibility settings.
 *
 * @param loggedInUser - User currently logged in
 * @param hiddenCards - Array of card IDs that are hidden
 * @param setHiddenCards - Function to update the hidden cards state
 * @param editmode - Boolean indicating if edit mode is active
 * @param theme - Theme object for styling
 *
 * @returns An array of homepage card configurations, each containing an ID, React element, grouping capability, and group reference.
 */
export const cardMemo = (
  loggedInUser: User | undefined,
  hiddenCards: string[],
  setHiddenCards: Dispatch<SetStateAction<string[]>>,
  editmode: boolean,
  theme: Theme
) => {
  const { isDeveloper, isTester } = useUserRole();
  const hasSeveraUserId = !!loggedInUser?.attributes?.severaUserId;

  const cardsConfig = [
    {
      id: "balance-card",
      visible: isDeveloper && hasSeveraUserId,
      element: BalanceCard,
      canGroup: true,
      group: undefined
    },
    {
      id: "sprint-view-card",
      visible: isDeveloper,
      element: SprintViewCard,
      canGroup: false,
      group: undefined
    },
    {
      id: "vacations-card",
      visible: isDeveloper,
      element: VacationsCard,
      canGroup: false,
      group: undefined
    },
    {
      id: "questionnaires-card",
      visible: isDeveloper,
      element: QuestionnaireCard,
      canGroup: true,
      group: undefined
    },
    {
      id: "wiki-documentation-card",
      visible: isTester,
      element: WikiDocumentationCard,
      canGroup: false,
      group: undefined
    },
    {
      id: "on-call-card",
      visible: isDeveloper,
      element: OnCallCard,
      canGroup: false,
      group: undefined
    },
    {
      id: "schedule-card",
      visible: isDeveloper,
      element: ScheduleCard,
      canGroup: false,
      group: undefined
    }
  ];

  const cards: HomepageCardType[] = useMemo(
    () =>
      cardsConfig.map((card) => ({
        id: card.id,
        element: card.visible ? (
          <card.element
            hidden={hiddenCards.includes(card.id)}
            onToggleHidden={(isVisible: boolean) => toggleCard(card.id, isVisible, setHiddenCards)}
            editmode={editmode}
          />
        ) : (
          card.id === "balance-card" &&
          renderCardWithSkeleton(strings.balanceCard.balance, card.visible, theme)
        ),
        canGroup: card.canGroup,
        group: card.group
      })),
    [editmode, isTester, isDeveloper, hasSeveraUserId, hiddenCards]
  );

  return cards;
};
