import { 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Typography, 
  Box, 
  Tooltip,
  IconButton,
  Badge
} from "@mui/material";
import { AvatarWrapper } from "../trello-cards/card-avatars";
import strings from "src/localization/strings";
import UserRoleUtils from "src/utils/user-role-utils";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline"
import ReactMarkdown from "react-markdown";
import { TrelloCard, TrelloMember } from "src/generated/homeLambdasClient";

/**
 * Interface for CardFilter component
 * 
 * @param card Trello card data to be displayed
 * @param members list of Trello members 
 * @param onOpenCard callback triggered when the open button is clicked
 * @param onDeleteCard callback triggered when the delete button is clicked
 */
interface CardItemProps {
  card: TrelloCard;
  members: TrelloMember[];
  onOpenCard: (card: TrelloCard) => void;
  onDeleteCard: (id: string) => void;
}

/**
 * CardItem component with key functionalities: to view, delete and display data
 */
const CardItem = ({ 
  members,
  card, 
  onOpenCard, 
  onDeleteCard 
}: CardItemProps) => {
  const adminMode = UserRoleUtils.adminMode();

  /**
   * Renders images inside the ReactMarkdown component
   * 
   * @param props  image props
   */
  const renderImage = (props: any) => (
    <img
      src={props.src}
      alt={props.alt ?? "Image"}
      style={{
        width: "100%",
        height: "auto",
        cursor: "pointer",
      }}
    />
  );

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "400px",
        position: "relative",
      }}
    >
      <CardContent sx={{ flexGrow: 1, height: '40%' }}>
        <Typography variant="h6">{card.title}</Typography>
        <Box style={{height: '80%', overflow: 'hidden'}}>
          <ReactMarkdown
            components={{
              img: renderImage
            }}
          >
            {card.description ? card.description : `${strings.cardRequestError.noDescription}`}
          </ReactMarkdown>
        </Box>
      </CardContent>
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
        }}
      >
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Button onClick={() => onOpenCard(card)} variant="outlined">
            { strings.cardScreen.open}
          </Button>
          {!adminMode && (<Button onClick={() => onDeleteCard(card.cardId || "")} variant="outlined" color="error">
            {strings.cardScreen.delete}
          </Button>
          )}
        </Box>
        <Box
          sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        >
          <Tooltip title={(card.comments || []).length > 0 ?
            <Box>
              {card.comments?.reduce((sum: any, comment: any) => {
                const author = members.find(member => member.memberId === comment.createdBy)?.fullName || '';
                const existing = sum.find((item: any) => item.includes(author));
                if (existing) {
                  const count = parseInt(existing.split(" ")[0]) + 1;
                  sum = sum.filter((item: any) => !item.includes(author));
                  sum.push(
                    count > 1
                      ? strings.cardScreen.messagesFrom
                        .replace("{count}", count.toString())
                        .replace("{author}", author)
                      : strings.cardScreen.messageFrom
                        .replace("{count}", "1")
                        .replace("{author}", author)
                  );
                } else {
                  sum.push(
                    strings.cardScreen.messageFrom
                      .replace("{count}", "1")
                      .replace("{author}", author)
                  );
                }
                return sum;
              }, [])
                .map((text: any, memberId: any) => (
                  <div key={memberId}>{text}</div>
                )) || <div>{strings.cardRequestError.noComments}</div>}
            </Box>
            : ""
          }>
            <IconButton>
              <Badge
                badgeContent={card.comments?.length || 0}
                color="primary"
                overlap="circular"
              >
                <ChatBubbleOutlineIcon />
              </Badge>
            </IconButton> 
          </Tooltip>
        </Box>
        <AvatarWrapper memberIds={card.assignedPersons || []} members={members} />
      </CardActions>
    </Card>
  )
}

export default CardItem;