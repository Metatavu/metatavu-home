import { Box, CircularProgress } from "@mui/material";
import CardItem from "./card-item";
import { TrelloCard, TrelloMember } from "src/generated/homeLambdasClient";

/**
 * Interface for CardFilter component
 * 
 * @param cards list of Trello cards to be displayed 
 * @param members list of Trello members 
 * @param onOpenCard callback triggered when the open button is clicked
 * @param loading  flag indicates if card data is still loading
 * @param onDeleteCard callback triggered when the delete button is clicked
 */
interface CardListProps {
  members:TrelloMember[];
  cards: TrelloCard[];
  loading: boolean;
  onOpenCard: (card: TrelloCard) => void;
  onDeleteCard: (id: string) => void;
}

/**
 * CardList component which renders a list of Trello cards
 */
const CardList = ({
  members, 
  cards, 
  loading, 
  onOpenCard, 
  onDeleteCard 
}: CardListProps) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: 2,
    }}
  >
    {loading ? (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    ) : (
      cards.map((card) => (
        <CardItem
          key={card.cardId}
          card={card}
          onOpenCard={onOpenCard}
          onDeleteCard={onDeleteCard}
          members={members}
        />
      ))
    )}
  </Box>
);

export default CardList;