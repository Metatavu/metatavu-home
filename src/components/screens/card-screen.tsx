import { useState, useEffect } from "react";
import {Box} from "@mui/material";
import { useLambdasApi } from "src/hooks/use-api";
import { TrelloCard, TrelloMember } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";
import CardForm from "../trello-cards/card-form-component";
import CardFilter from "../trello-cards/card-filter";
import CardList from "../trello-cards/card-list";
import ImagePreviewDialog from "../trello-cards/image-preview-dialog";
import CardDialog from "../trello-cards/card-dialog";

/**
 * Card screen component
 */
const CardScreen = () => {
  const [cards, setCards] = useState<TrelloCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [members, setMembers] = useState<TrelloMember[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCard, setSelectedCard] = useState<any>();
  const [comment, setComment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { trelloApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    fetchCards();
  }, []);

  /**
   * Fetches Trello cards and board members
   */
  const fetchCards = async () => {
    setLoading(true);
    try {
      const cards = await trelloApi.listCards();
      const members = await trelloApi.getBoardMembersEmails();
      setMembers(members);
      setCards(cards);
      setFilteredCards(cards);
    } catch (error) {
      setError(`${strings.cardRequestError.errorFetchingCards}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Filters cards based on the user input in the filter field
   * 
   * @param event event
   */
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setFilterQuery(query);
    setFilteredCards(cards.filter((card) => card.title?.toLowerCase().includes(query)));
  };

  /**
   * Deletes a card by its ID
   * 
   * @param id card ID to delete
   */
  const deleteCard = async (id: string) => {
    try {
      const deleteCardResponse = await trelloApi.deleteCard({ id });
      if (deleteCardResponse.message === "Card deleted successfully") {
        const updatedCards = cards.filter((card) => card?.cardId !== id);
        const updatedFilteredCards = filteredCards.filter((card) => card?.cardId !== id);
        setCards(updatedCards);
        setFilteredCards(updatedFilteredCards);
      }
    } catch (error) {
      setError(`${strings.cardRequestError.errorDeletingCard}, ${error}`);
    }
  };
  
  /**
   * Creates a new card with the specified title and description
   */
  const createCard = async () => {
    try {
      const cardCreated = await trelloApi.createCard({ createCardRequest: {title: title, description: description} });
      if (cardCreated.cardId) {
        const newCard = {
          cardId: cardCreated.cardId,
          title: title,
          description: description,
          assignedPersons: [],
          comments: []
        }
        setCards([...cards, newCard]);
        if (cardCreated.title?.toLowerCase().includes(filterQuery)) 
          setFilteredCards([...filteredCards, newCard]);
      }
      setTitle("");
      setDescription("");
    } catch (error) {
      setError(`${strings.cardRequestError.errorCreatingCard}, ${error}`);
    }
  };

  /**
   * Adds a comment to the selected card
   */
  const createComment = async () => {
    if (selectedCard) {
      try {
        const newComment = {
          text: comment,
          createdBy: members[0].memberId // need to be replaced with the actual user
        };

        await trelloApi.createComment({
          createCommentRequest: { comment: newComment.text, cardId: selectedCard.cardId },
        });

        const updatedSelectedCard = {
          ...selectedCard,
          comments: [...selectedCard.comments, newComment],
        };

        const updatedCards = cards.map((card) =>
          card.cardId === selectedCard.cardId ? updatedSelectedCard : card
        );

        const updatedFilteredCards = filteredCards.map((card) =>
          card.cardId === selectedCard.cardId ? updatedSelectedCard : card
        );

        setSelectedCard(updatedSelectedCard);
        setCards(updatedCards);
        setFilteredCards(updatedFilteredCards);
        setComment("");
      } catch (error) {
        setError(`${strings.cardRequestError.errorAddingComment}, ${error}`);
      }
    }
  };

  /**
   * Opens the details dialog for a selected card
   * 
   * @param card Trello card
   */
  const openCard = (card: any) => {
    setIsDialogOpen(true);
    setSelectedCard(card);
  };

  /**
   * Closes the card details dialog
   */
  const closeCard = () => {
    setSelectedCard({});
    setIsDialogOpen(false);
  };

  /**
   * Opens a full-size image dialog for the specified image
   * 
   * @param src The source image UR
   */
  const openImage = (src: string) => {
    setSelectedImage(src);
    setIsImageOpen(true);
  };

  /**
   * Closes the image dialog
   */
  const closeImage = () => {
    setSelectedImage(null);
    setIsImageOpen(false);
  };
  
  return (
    <Box>
      <CardForm
        title={title}
        description={description}
        onTitleChange={(event) => setTitle(event.target.value)}
        onDescriptionChange={(event) => setDescription(event.target.value)}
        onCreateCard={createCard}
      />
      <CardFilter filterQuery={filterQuery} onFilterChange={handleFilterChange} />
      <CardList
        cards={filteredCards}
        loading={loading}
        onOpenCard={openCard}
        onDeleteCard={deleteCard}
        members={members}
      />
      <Box>
        {selectedCard && (
          <CardDialog
            isOpen={isDialogOpen}
            selectedCard={selectedCard}
            members={members}
            comment={comment}
            onCommentChange={(event) => setComment(event.target.value)}
            onClose={closeCard}
            onCreateComment={createComment}
            onImageClick={openImage}
          />
        )}
        <ImagePreviewDialog
          isOpen={isImageOpen}
          selectedImage={selectedImage}
          onClose={closeImage}
        />
      </Box>
    </Box>
  );
};

export default CardScreen;