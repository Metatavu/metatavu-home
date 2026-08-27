import Masonry from "@mui/lab/Masonry";
import { Box, Grid } from "@mui/material";
import type { ReactNode } from "react";
import type { HomepageCardType } from "src/components/screens/createHomeCards";
import { DraggableCard, DroppableCard } from "src/utils/cardUtils";

/**
 * Renders card content.
 *
 * @param card - Card to render
 * @param editmode - Boolean defining editmode.
 * @returns Rendered card content.
 */
const renderCardContent = (card: HomepageCardType, editmode: boolean): JSX.Element | ReactNode => {
  if (card.group) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row"
        }}>
        {editmode ? (
          <>
            <DraggableCard id={card.id} canGroup={card.canGroup}>
              {card.element}
            </DraggableCard>
            <DraggableCard id={card.group.id} canGroup={card.group.canGroup}>
              {card.group.element}
            </DraggableCard>
          </>
        ) : (
          <>
            {card.element}
            {card.group.element}
          </>
        )}
      </Box>
    );
  }

  if (editmode) {
    return (
      <DraggableCard id={card.id} canGroup={card.canGroup}>
        {card.element}
      </DraggableCard>
    );
  }

  return card.element;
};

/**
 * Renders cards to a column.
 *
 * @param column - column to render
 * @param editmode - Boolean for editmode
 * @param dragOverGroup - Boolean defining wheter a draggable can form a group
 * @returns Array of rendered card elements.
 */
const renderColumn = (column: HomepageCardType[], editmode: boolean, dragOverGroup: boolean) => {
  return column.map((card) => {
    const content = renderCardContent(card, editmode);

    if (!editmode) {
      return (
        <Grid key={card.id} id={card.id}>
          {content}
        </Grid>
      );
    }

    return (
      <DroppableCard
        key={card.id}
        id={card.id}
        canGroup={card.canGroup}
        dragOverGroup={dragOverGroup}
      >
        {content}
      </DroppableCard>
    );
  });
};

interface CardGridWrapperProps {
  children: HomepageCardType[];
  hiddenCards: string[];
  editmode: boolean;
  dragOverGroup: boolean;
}
/**
 * CardGridWrapper component.
 *
 * A reusable layout wrapper that arranges card components.
 * in a responsive grid that supports drag and drop re-ordering.
 *
 * @param props.children - Array of card components to render in the layout.
 * @param props.hiddenCards - Array of card id's that are hidden.
 * @param props.editmode - Boolean that defines if editmode is on or off.
 * @param props.dragOverGroup - Boolean can draggable group.
 *
 * @returns JSX element containing the wrapped cards.
 */
const CardGridWrapper = ({
  children,
  hiddenCards,
  editmode,
  dragOverGroup
}: CardGridWrapperProps) => {
  const visible = children.filter((item) => !hiddenCards.includes(item.id));
  const hidden = children.filter((item) => hiddenCards.includes(item.id));
  const firstColumn = visible.slice(0, visible.length / 2);
  const secondColumn = visible.slice(visible.length / 2, visible.length);

  return (
    <Box>
      <Grid container spacing={{ xs: 1, sm: 2 }} columns={2}>
        <Grid size={{ xs: 2, sm: 1 }}>{renderColumn(firstColumn, editmode, dragOverGroup)}</Grid>

        <Grid size={{ xs: 2, sm: 1 }}>{renderColumn(secondColumn, editmode, dragOverGroup)}</Grid>
      </Grid>

      {editmode && hidden.length > 0 && (
        <Grid sx={{ mt: 3 }}>
          <Masonry columns={2} spacing={2}>
            {hidden.map((card) => (
              <Grid key={card.id}>{card.element}</Grid>
            ))}
          </Masonry>
        </Grid>
      )}
    </Box>
  );
};

export default CardGridWrapper;
