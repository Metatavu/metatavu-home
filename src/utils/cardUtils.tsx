import type { UniqueIdentifier } from "@dnd-kit/abstract";
import { useDraggable, useDroppable } from "@dnd-kit/react";
import { DragIndicator } from "@mui/icons-material";
import { Skeleton, type Theme, useTheme } from "@mui/material";
import { Box, Grid } from "@mui/system";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { HomepageCardType } from "src/components/screens/createHomeCards";
import strings from "src/localization/strings";

/**
 * Hides/unhides a card when toggle is switched.
 *
 * @param id - Id of the card that should be hidden/unhidden.
 * @param shouldBeVisible - Boolean for the card should be visible or not.
 * @param setHiddenCards - Set hidden cards in an array.
 */
export const toggleCard = (
  id: string,
  shouldBeVisible: boolean,
  setHiddenCards: Dispatch<SetStateAction<string[]>>
): void => {
  setHiddenCards((prev: string[]) => {
    if (shouldBeVisible) {
      return prev.filter((x) => x !== id);
    }
    return [...prev, id];
  });
};

interface DragDropProps {
  id: UniqueIdentifier;
  children: ReactNode;
  canGroup: boolean;
}
interface DroppableProps extends DragDropProps {
  dragOverGroup: boolean;
}

/**
 * DraggableCard component.
 * Dnd-kit draggable component, ie. the component to be dragged.
 * Can only be dragged from a handle.
 *
 * @param props.id - ID of the dragged card.
 * @param props.children - Contents of the draggable card.
 * @param props.canGroup - Boolean indicating if card can be small
 *                         next to another card.
 *
 * @returns Draggable card component.
 */
export const DraggableCard = ({ id, children, canGroup }: DragDropProps): JSX.Element => {
  const theme = useTheme();
  const { ref, handleRef } = useDraggable({
    id,
    data: {
      canGroup
    }
  });
  return (
    <Grid
      container
      direction="row"
      ref={ref}
      wrap="nowrap"
      sx={{
        width: "100%"
      }}
    >
      <DragIndicator
        ref={handleRef}
        sx={{ marginTop: theme.spaces.xs, fontSize: 24, cursor: "grab" }}
      />
      {children}
    </Grid>
  );
};

/**
 * DroppableCard component.
 * Dnd-kit droppable component, ie. the component draggables are dropped on.
 *
 * @param props.id - ID of the card currently in droppable.
 * @param props.children - Contents of the droppable.
 * @param props.canGroup - Boolean indicating if the card currently in
 *                         droppable can be small next to another card.
 * @param props.dragOverGroup - Boolean defining if draggable over droppable
 *                              can group.
 *
 * @returns Droppable card component.
 */
export const DroppableCard = ({
  id,
  children,
  canGroup,
  dragOverGroup
}: DroppableProps): JSX.Element => {
  const theme = useTheme();
  const group = dragOverGroup && canGroup;
  const { ref, isDropTarget } = useDroppable({
    id,
    data: {
      canGroup
    }
  });

  return isDropTarget ? (
    <Grid
      ref={ref}
      sx={{
        borderTopWidth: group ? 0 : theme.borders.m,
        borderTopStyle: "solid",
        backgroundColor: group
          ? theme.palette.background.selected
          : theme.palette.background.default,
        borderRadius: group ? theme.radius.s : 0,
        borderColor: theme.palette.background.selected
      }}
    >
      {children}
    </Grid>
  ) : (
    <Grid ref={ref}>{children}</Grid>
  );
};

/**
 * Moves card on screen according to users actions.
 *
 * @param sourceId - ID of the card that was dragged.
 * @param targetId - ID of the target.
 * @param orderedCards - List of cards in order.
 * @param setSavedOrder - Updates card order in an array of strings.
 * @param canGroup - Boolean indicating if source card can group.
 */
export const moveCard = (
  sourceId: UniqueIdentifier | undefined,
  targetId: UniqueIdentifier | undefined,
  orderedCards: HomepageCardType[],
  setSavedOrder: Dispatch<SetStateAction<string[]>>,
  canGroup: boolean
): void => {
  if (canGroup) {
    const updated = unGroupCard(sourceId, targetId, orderedCards);
    if (updated) {
      setSavedOrder(updated.map((item) => (item.group ? `${item.id}|${item.group.id}` : item.id)));
      return;
    }
  }
  const initialIndex = orderedCards.findIndex((item) => item.id === sourceId);
  const index = orderedCards.findIndex((item) => item.id === targetId);

  if (initialIndex === -1 || index === -1) {
    return;
  }
  const updated = [...orderedCards];
  const removed = updated[initialIndex];
  updated.splice(initialIndex, 1);
  updated.splice(index, 0, removed);

  setSavedOrder(updated.map((item) => (item.group ? `${item.id}|${item.group.id}` : item.id)));
};

/**
 * Adds cards to a group.
 *
 * @param sourceId - ID of the dragged card.
 * @param targetId - ID of the target.
 * @param orderedCards - Cards in order.
 * @param setSavedOrder - Updates card order in an array of strings.
 */
export const groupCard = (
  sourceId: UniqueIdentifier | undefined,
  targetId: UniqueIdentifier | undefined,
  orderedCards: HomepageCardType[],
  setSavedOrder: Dispatch<SetStateAction<string[]>>
): void => {
  const source = orderedCards.find((c) => c.id === sourceId);
  const target = orderedCards.find((c) => c.id === targetId);

  if (!source || !target) return;
  if (!source.canGroup || !target.canGroup) return;
  if (source === target) return;

  const updated = orderedCards.map((c) => {
    if (c.id === targetId) {
      return {
        ...c,
        group: source
      };
    }
    return c;
  });
  const noDuplicates = updated.filter((item) => item.id !== source.id);

  setSavedOrder(noDuplicates.map((item) => (item.group ? `${item.id}|${item.group.id}` : item.id)));
};

/**
 * Un-groups cards that were in a group.
 *
 * @param sourceId - ID of the dragged card
 * @param targetId - ID of the target
 * @param orderedCards - Cards in ordered array.
 *
 * @returns Order of cards or undefined.
 */
export const unGroupCard = (
  sourceId: UniqueIdentifier | undefined,
  targetId: UniqueIdentifier | undefined,
  orderedCards: HomepageCardType[]
): HomepageCardType[] | undefined => {
  const groupItem = orderedCards.find((item) => item.group);
  const initialIndex = orderedCards.findIndex((item) => item.id === groupItem?.id);
  const targetIndex = orderedCards.findIndex((item) => item.id === targetId);
  const groupPair = groupItem?.group;

  if (!groupItem || !groupPair) return;
  if (!groupItem.canGroup || !groupPair.canGroup) return;

  if (sourceId === groupItem.id) {
    const updated = [...orderedCards];
    updated[initialIndex] = groupPair;
    updated.splice(targetIndex, 0, { ...groupItem, group: undefined });
    return updated;
  }
  const updated = [...orderedCards];
  updated[initialIndex] = { ...groupItem, group: undefined };
  updated.splice(targetIndex, 0, groupPair);
  return updated;
};

/**
 * Renders a card with a skeleton loader
 *
 * @param title - Title of the card
 * @param hasSeveraUserId - Boolean indicating if user has severa user ID.
 * @param theme - MUI theme.
 *
 * @returns ReactNode containing the card
 */
export const renderCardWithSkeleton = (title: string, hasSeveraUserId: boolean, theme: Theme) => (
  <Box
    sx={{
      background: theme.palette.background.paper,
      maxWidth: 538,
      borderRadius: 1,
      boxShadow: theme.shadows[1],
      minHeight: title === strings.sprint.sprintview ? 270 : 120,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor: theme.palette.action.hover
      }
    }}
  >
    <Grid sx={{ padding: 2 }}>
      <Box sx={{ fontWeight: "bold", fontSize: 22 }}>{title}</Box>
      {!hasSeveraUserId && (
        <>
          <div style={{ color: theme.palette.text.secondary, fontSize: 15, padding: "12px 0" }}>
            {strings.notOptedInDescription.description}
          </div>
          <Skeleton
            variant="rectangular"
            height={20}
            sx={{ borderRadius: 1, marginTop: 1, width: "100%" }}
          />
        </>
      )}
    </Grid>
  </Box>
);
