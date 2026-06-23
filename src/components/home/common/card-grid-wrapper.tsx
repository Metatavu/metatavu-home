import Masonry from "@mui/lab/Masonry";
import { Box, Grid } from "@mui/material";
import type { HomepageCardType } from "src/components/screens/home-screen";
import { DraggableCard, DroppableCard } from "src/utils/cardUtils";

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
  const visible = children.filter((child: any) => !hiddenCards.includes(child.id));
  const hidden = children.filter((child: any) => hiddenCards.includes(child.id));
  const rows = {
    firstRow: visible.slice(0, visible.length / 2),
    secondRow: visible.slice(visible.length / 2, visible.length)
  };
  const firstRowContainer = [...rows.firstRow].map((item: any) => item.id);
  const secondRowContainer = [...rows.secondRow].map((item: any) => item.id);

  return (
    <Box>
      {editmode && (
        <Grid container spacing={{ xs: 1, sm: 2 }} columns={2}>
          <Grid size={{ xs: 2, sm: 1 }}>
            {firstRowContainer.map((item, index) => {
              const card = rows.firstRow[index];

              return (
                <DroppableCard
                  key={item}
                  id={item}
                  canGroup={card.canGroup}
                  dragOverGroup={dragOverGroup}
                >
                  {card?.group ? (
                    <Box display="flex" flexDirection="row">
                      <DraggableCard id={card.id} canGroup={card.canGroup}>
                        {card.element}
                      </DraggableCard>
                      <DraggableCard id={card.group.id} canGroup={card.group.canGroup}>
                        {card.group?.element}
                      </DraggableCard>
                    </Box>
                  ) : (
                    <DraggableCard id={card.id} canGroup={card.canGroup}>
                      {card.element}
                    </DraggableCard>
                  )}
                </DroppableCard>
              );
            })}
          </Grid>

          <Grid size={{ xs: 2, sm: 1 }}>
            {secondRowContainer.map((item, index) => {
              const card = rows.secondRow[index];

              return (
                <DroppableCard
                  key={item}
                  id={item}
                  canGroup={card.canGroup}
                  dragOverGroup={dragOverGroup}
                >
                  {card?.group ? (
                    <Box display="flex" flexDirection="row">
                      <DraggableCard id={card.id} canGroup={card.canGroup}>
                        {card.element}
                      </DraggableCard>
                      <DraggableCard id={card.group.id} canGroup={card.group.canGroup}>
                        {card.group?.element}
                      </DraggableCard>
                    </Box>
                  ) : (
                    <DraggableCard id={card.id} canGroup={card.canGroup}>
                      {card.element}
                    </DraggableCard>
                  )}
                </DroppableCard>
              );
            })}
          </Grid>
        </Grid>
      )}

      {!editmode && (
        <Grid container spacing={{ xs: 1, sm: 2 }} columns={2}>
          <Grid size={{ xs: 2, sm: 1 }}>
            {rows.firstRow.map((child) => (
              <Grid key={child.id} id={child.id}>
                {child.group ? (
                  <Box display="flex" flexDirection="row">
                    {child.element}
                    {child.group?.element}
                  </Box>
                ) : (
                  <Grid key={child.id} id={child.id}>
                    {child.element}
                  </Grid>
                )}
              </Grid>
            ))}
          </Grid>

          <Grid size={{ xs: 2, sm: 1 }}>
            {rows.secondRow.map((child) => (
              <Grid key={child.id} id={child.id}>
                {child.group ? (
                  <Box display="flex" flexDirection="row">
                    {child.element}
                    {child.group.element}
                  </Box>
                ) : (
                  <Grid key={child.id} id={child.id}>
                    {child.element}
                  </Grid>
                )}
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}

      {editmode && hidden.length > 0 && (
        <Grid sx={{ mt: 3 }}>
          <Masonry columns={2} spacing={2}>
            {hidden.map((child: any) => (
              <Grid key={child.id}>{child.element}</Grid>
            ))}
          </Masonry>
        </Grid>
      )}
    </Box>
  );
};

export default CardGridWrapper;
