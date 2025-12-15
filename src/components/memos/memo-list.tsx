import { 
  Card, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography 
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { DateTime } from "luxon";
import dayjs from "dayjs";
import strings from "src/localization/strings";
import { PdfFile } from "src/generated/homeLambdasClient";

/**
 * Interface for the MemoList component
 * 
 * @param selectedYear selected year for filtering files
 * @param setSelectedYear callback to update the selected year
 * @param fileList list of pdf files
 * @param setSelectedFileId callback to update the selected file ID 
 */
interface MemoListProps {
  selectedYear: DateTime | null;
  setSelectedYear: (date: DateTime | null) => void;
  fileList: PdfFile[];
  setSelectedFileId: (id: string) => void;
}

/**
 * MemoList Component
 * 
 * Displays a sidebar for selecting PDF files by year, a year picker and a list of available files
 */
const MemoList = ({ 
  selectedYear, 
  setSelectedYear, 
  fileList, 
  setSelectedFileId 
}: MemoListProps) => (
  <Card sx={{ 
    width: "300px", 
    p: 2, 
    mr: 2 
  }}>
    <Typography 
      variant="h6" 
      mb={2} 
      pl={"50px"}
    >
      {strings.memoScreen.selectPdf}
    </Typography>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={strings.memoScreen.selectYear}
        value={selectedYear ? dayjs(selectedYear.toISO()) : null}
        onChange={(date) => {
          if (date) {
            setSelectedYear(DateTime.fromISO(date.toISOString()));
          }
        }}
        views={["year"]}
        minDate={dayjs("2023-01-01")}
        maxDate={dayjs("2034-01-01")}
        disableFuture
        slotProps={{
          layout: { sx: {maxHeight: "140px"} }
        }}
      />
    </LocalizationProvider>
    <List sx={{ mt: 2, maxHeight: "80%", overflowY: 'auto' }}>
      {fileList.map((file) => (
        <ListItem key={file.id} disablePadding>
          <ListItemButton onClick={() => setSelectedFileId(file.id || "")}>
            <ListItemIcon>
              <PictureAsPdfIcon />
            </ListItemIcon>
            <ListItemText primary={file.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Card>
);

export default MemoList;