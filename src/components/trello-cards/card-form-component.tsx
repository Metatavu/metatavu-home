import { 
  Card, 
  TextField, 
  Button, 
  Typography 
} from "@mui/material";
import strings from "src/localization/strings";

/**
 * Interface for CardFilter component
 * 
 * @param title the title of the new card
 * @param description the description of the new card
 * @param onTitleChange callback that handles changes to the title field
 * @param onDescriptionChange callback that handles changes to the description field
 * @param onCreateCard callback triggered when the create button is clicked
 */
interface CreateCardFormProps {
  title: string;
  description: string;
  onTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateCard: () => void;
}

/**
 * CreateCardForm component to render a form for creating a new card
 */
const CreateCardForm = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onCreateCard,
}: CreateCardFormProps) => (
  <Card sx={{ mb: 2, p: 2 }}>
    <Typography variant="h6">
      {strings.cardScreen.createNewCard}
    </Typography>
    <TextField
      label="Title"
      value={title}
      onChange={onTitleChange}
      fullWidth
      sx={{ mt: 1 }}
    />
    <TextField
      label="Description"
      value={description}
      onChange={onDescriptionChange}
      multiline
      rows={4}
      fullWidth
      sx={{ mt: 1 }}
    />
    <Button 
      onClick={onCreateCard} 
      variant="contained" 
      sx={{ mt: 1 }}
    >
      {strings.cardScreen.createCard}
    </Button>
  </Card>
);

export default CreateCardForm;