/** biome-ignore-all lint/correctness/useUniqueElementIds: Keep static id */
import { DragDropProvider } from "@dnd-kit/react";
import { EditOutlined } from "@mui/icons-material";
import { Box, type Theme, Typography, useTheme } from "@mui/material";
import { useAtomValue } from "jotai";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { OnboardingScreen } from "src/types/index";
import { groupCard, moveCard } from "src/utils/cardUtils";
import { getTimeBasedGreeting } from "src/utils/time-utils";
import { getDisplayName } from "src/utils/user-name-utils";
import AppButton from "../generics/buttons/app-button";
import CardGridWrapper from "../home/common/card-grid-wrapper";
import Onboarding from "../onboarding/Onboarding";
import { cardMemo, type HomepageCardType } from "./createHomeCards";

/**
 * Home screen component.
 * Defines homepage cards and their order.
 * Saves user's layout to local storage.
 * Handles drag and drop logic.
 * Displays a time-based greeting with the user's display name.
 */
const HomeScreen = () => {
  const theme = useTheme();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);

  const [editmode, setEditmode] = useState(false);
  const [savedOrder, setSavedOrder] = useState<string[]>([]);
  const [hiddenCards, setHiddenCards] = useState<string[]>([]);
  const [dragOverGroup, setDragOverGroup] = useState(false);
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const HIDDEN_CARDS_KEY = "hiddenCards";
  const ORDER_KEY = "order";
  const displayName = getDisplayName(loggedInUser);
  const greetingString = `${getTimeBasedGreeting()}, ${displayName}!`;
  const cards = cardMemo(loggedInUser, hiddenCards, setHiddenCards, editmode, theme);

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

    const missingCards = cards.filter(
      (card) =>
        !sorted.some((sortedCard) => sortedCard.id === card.id || sortedCard.group?.id === card.id)
    );

    return [...sorted, ...missingCards];
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
