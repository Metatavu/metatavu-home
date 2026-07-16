/** biome-ignore-all lint/correctness/useUniqueElementIds: Keep static id */
import { DragDropProvider } from "@dnd-kit/react";
import { EditOutlined } from "@mui/icons-material";
import { Box, Typography, useTheme } from "@mui/material";
import { useAtomValue } from "jotai";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { OnboardingScreen } from "src/types/index";
import { groupCard, moveCard, renderCardWithSkeleton, toggleCard } from "src/utils/cardUtils";
import { getTimeBasedGreeting } from "src/utils/time-utils";
import { getDisplayName } from "src/utils/user-name-utils";
import AppButton from "../generics/buttons/app-button";
import BalanceCard from "../home/balance-card";
import CardGridWrapper from "../home/common/card-grid-wrapper";
import OnCallCard from "../home/oncall-card";
import QuestionnaireCard from "../home/questionnaire-card";
import ScheduleCard from "../home/scheduleCard/scheduleCard";
import SoftwareRegistryCard from "../home/software-registry-card";
import SprintViewCard from "../home/sprint-view-card";
import VacationsCard from "../home/vacations-card";
import WikiDocumentationCard from "../home/wiki-documentation-card";
import Onboarding from "../onboarding/Onboarding";

export type HomepageCardType = {
  id: string;
  element: ReactNode;
  canGroup: boolean;
  group: HomepageCardType | undefined;
};

/**TODO: cards array takes up space and makes this file confusing.
 * Consider moving it for clarity.
 *
 * Home screen component.
 * Defines homepage cards and their order.
 * Saves user's layout to local storage.
 * Handles drag and drop logic.
 * Displays a time-based greeting with the user's display name.
 */
const HomeScreen = () => {
  const theme = useTheme();
  const { isDeveloper, isTester } = useUserRole();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const language = strings.getLanguage();

  const [editmode, setEditmode] = useState(false);
  const [savedOrder, setSavedOrder] = useState<string[]>([]);
  const [hiddenCards, setHiddenCards] = useState<string[]>([]);
  const [dragOverGroup, setDragOverGroup] = useState(false);
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const HIDDEN_CARDS_KEY = "hiddenCards";
  const ORDER_KEY = "order";
  const hasSeveraUserId = !!loggedInUser?.attributes?.severaUserId;
  const displayName = getDisplayName(loggedInUser);
  const greetingString = `${getTimeBasedGreeting()}, ${displayName}!`;

  useEffect(() => {
    const previousOrder = localStorage.getItem(ORDER_KEY);
    const previousHidden = localStorage.getItem(HIDDEN_CARDS_KEY);

    if (previousOrder) {
      setSavedOrder(JSON.parse(previousOrder));
    }
    if (previousHidden) {
      setHiddenCards(JSON.parse(previousHidden));
    }

    setLayoutLoaded(true);
  }, []);

  const handleEdit = (action?: string) => {
    setEditmode((prev) => !prev);
    if (action === "save") {
      localStorage.setItem(HIDDEN_CARDS_KEY, JSON.stringify(hiddenCards));
      localStorage.setItem(
        ORDER_KEY,
        JSON.stringify(
          orderedCards.map((item) => (item.group ? `${item.id}|${item.group?.id}` : item.id))
        )
      );
      return;
    }

    const previousCards = localStorage.getItem(HIDDEN_CARDS_KEY);
    const previousOrder = localStorage.getItem(ORDER_KEY);
    setHiddenCards(previousCards ? JSON.parse(previousCards) : []);
    previousOrder
      ? setSavedOrder(JSON.parse(previousOrder))
      : setSavedOrder(cards.map((item) => (item.group ? `${item.id}|${item.group?.id}` : item.id)));
  };

  const cards: HomepageCardType[] = useMemo(
    () => [
      {
        id: "balance-card",
        element:
          isDeveloper &&
          (hasSeveraUserId ? (
            <BalanceCard
              hidden={hiddenCards.includes("balance-card")}
              onToggleHidden={(isVisible: boolean) =>
                toggleCard("balance-card", isVisible, setHiddenCards)
              }
              editmode={editmode}
            />
          ) : (
            renderCardWithSkeleton(strings.balanceCard.balance, hasSeveraUserId, theme)
          )),
        canGroup: true,
        group: undefined
      },
      {
        id: "sprint-view-card",
        element: isDeveloper && (
          <SprintViewCard
            hidden={hiddenCards.includes("sprint-view-card")}
            onToggleHidden={(isVisible: boolean) =>
              toggleCard("sprint-view-card", isVisible, setHiddenCards)
            }
            editmode={editmode}
          />
        ),
        canGroup: false,
        group: undefined
      },
      {
        id: "vacations-card",
        element: isDeveloper && (
          <VacationsCard
            hidden={hiddenCards.includes("vacations-card")}
            onToggleHidden={(isVisible: boolean) =>
              toggleCard("vacations-card", isVisible, setHiddenCards)
            }
            editmode={editmode}
          />
        ),
        canGroup: false,
        group: undefined
      },
      {
        id: "questionnaires-card",
        element: isDeveloper && (
          <QuestionnaireCard
            hidden={hiddenCards.includes("questionnaires-card")}
            onToggleHidden={(isVisible: boolean) =>
              toggleCard("questionnaires-card", isVisible, setHiddenCards)
            }
            editmode={editmode}
          />
        ),
        canGroup: true,
        group: undefined
      },
      {
        id: "software-registry-card",
        element: isDeveloper && <SoftwareRegistryCard />,
        canGroup: false,
        group: undefined
      },
      {
        id: "wiki-documentation-card",
        element: isTester && (
          <WikiDocumentationCard
            hidden={hiddenCards.includes("wiki-documentation-card")}
            onToggleHidden={(isVisible: boolean) =>
              toggleCard("wiki-documentation-card", isVisible, setHiddenCards)
            }
            editmode={editmode}
          />
        ),
        canGroup: false,
        group: undefined
      },
      {
        id: "on-call-card",
        element: isDeveloper && (
          <OnCallCard
            hidden={hiddenCards.includes("on-call-card")}
            onToggleHidden={(isVisible: boolean) =>
              toggleCard("on-call-card", isVisible, setHiddenCards)
            }
            editmode={editmode}
          />
        ),
        canGroup: false,
        group: undefined
      },
      {
        id: "schedule-card",
        element: isDeveloper && (
          <ScheduleCard
            hidden={hiddenCards.includes("schedule-card")}
            onToggleHidden={(isVisible: boolean) =>
              toggleCard("schedule-card", isVisible, setHiddenCards)
            }
            editmode={editmode}
          />
        ),
        canGroup: false,
        group: undefined
      }
    ],
    [editmode, isTester, isDeveloper, hasSeveraUserId, hiddenCards, language]
  );
  const orderedCards = useMemo(() => {
    if (!savedOrder.length) {
      return cards;
    }

    const cardMap = new Map(cards.map((card) => [card.id, card]));

    const seen = new Set<string>();

    const sorted = savedOrder
      .map((item) => {
        const [id, groupId] = item.split("|");

        const card = cardMap.get(id);
        if (!card) return null;

        if (groupId) {
          seen.add(groupId);
        }

        if (seen.has(id)) {
          return null;
        }

        if (groupId) {
          return {
            ...card,
            group: cardMap.get(groupId)
          };
        }
        return card;
      })
      .filter(Boolean) as HomepageCardType[];

    return sorted;
  }, [cards, savedOrder, hiddenCards]);

  //Cards won't render untill the save order is loaded
  if (!layoutLoaded) return null;

  return (
    <Box>
      <Typography variant="h3" sx={{ px: theme.spaces.m, pt: theme.spaces.m }}>
        {greetingString}
      </Typography>
      <Box id="home-screen" display="flex" flexDirection="column" alignItems="end">
        <Box>
          <AppButton
            variant="secondary"
            text={editmode ? strings.label.cancel : strings.label.customize}
            startIcon={!editmode && <EditOutlined />}
            onClick={() => handleEdit()}
            sx={{
              maxWidth: 132,
              height: 38,
              gap: theme.spaces.xs,
              margin: theme.spaces.s,
              marginInline: theme.spaces.s
            }}
          />
          {editmode && (
            <AppButton
              variant="primary"
              text={strings.label.save}
              onClick={() => handleEdit("save")}
              sx={{
                width: 68,
                height: 38,
                gap: theme.spaces.xs,
                margin: theme.spaces.s,
                marginInline: theme.spaces.s
              }}
            />
          )}
        </Box>
      </Box>
      <DragDropProvider
        onDragEnd={(event) => {
          const source = event.operation.source;
          const target = event.operation.target;
          if (source?.data.canGroup && target?.data.canGroup) {
            groupCard(source?.id, target?.id, orderedCards, setSavedOrder);
          } else {
            moveCard(source?.id, target?.id, orderedCards, setSavedOrder, source?.data.canGroup);
          }
        }}
        onDragOver={(event) => {
          setDragOverGroup(event.operation.source?.data.canGroup);
        }}
      >
        <CardGridWrapper
          hiddenCards={hiddenCards}
          editmode={editmode}
          dragOverGroup={dragOverGroup}
        >
          {orderedCards}
        </CardGridWrapper>
      </DragDropProvider>
      <Box id="onboarding-complete" sx={{ display: "none" }} />

      <Onboarding screen={OnboardingScreen.Home} />
    </Box>
  );
};

export default HomeScreen;
