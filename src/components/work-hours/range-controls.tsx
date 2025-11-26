import { ArrowBack, ArrowForward, CalendarToday } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip as MuiTooltip,
  Typography
} from "@mui/material";
import type { ChartDataPoint } from "./workDays-chart";

/**
 * Props for RangeControls component
 */
interface RangeControlsProps {
  selectedRange: "week" | "month" | "year";
  chartData: ChartDataPoint[];
  weekOffset: number;
  monthOffset: number;
  onWeekOffsetChange: (delta: number) => void;
  onMonthOffsetChange: (delta: number) => void;
  setSelectedRange: (range: "week" | "month" | "year") => void;
  strings: any;
}

/**
 * Range controls component
 */
const RangeControls = ({
  selectedRange,
  chartData,
  weekOffset,
  monthOffset,
  onWeekOffsetChange,
  onMonthOffsetChange,
  setSelectedRange,
  strings
}: RangeControlsProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "30px",
      position: "relative"
    }}
  >
    {/* WEEK CONTROLS */}
    {selectedRange === "week" && chartData[0] && (
      <Box
        sx={{
          position: "absolute",
          left: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "250px"
        }}
      >
        <MuiTooltip title={`${chartData[0].week}: ${chartData[0].period}`}>
          <Typography variant="h4">{chartData[0].week}</Typography>
        </MuiTooltip>
        <ButtonGroup sx={{ mt: 1 }}>
          <IconButton onClick={() => onWeekOffsetChange(-1)}>
            <ArrowBack />
          </IconButton>
          <IconButton disabled={weekOffset === 0} onClick={() => onWeekOffsetChange(1)}>
            <ArrowForward />
          </IconButton>
          <IconButton onClick={() => onWeekOffsetChange(0)}>
            <CalendarToday />
          </IconButton>
        </ButtonGroup>
      </Box>
    )}

    {/* MONTH CONTROLS */}
    {selectedRange === "month" && chartData[0] && (
      <Box
        sx={{
          position: "absolute",
          left: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "250px"
        }}
      >
        <Typography variant="h4">{`${strings.timeExpressions.month}: ${chartData[0].month}`}</Typography>
        <ButtonGroup sx={{ mt: 1 }}>
          <IconButton disabled={monthOffset === -12} onClick={() => onMonthOffsetChange(-1)}>
            <ArrowBack />
          </IconButton>
          <IconButton disabled={monthOffset === 0} onClick={() => onMonthOffsetChange(1)}>
            <ArrowForward />
          </IconButton>
          <IconButton onClick={() => onMonthOffsetChange(0)}>
            <CalendarToday />
          </IconButton>
        </ButtonGroup>
      </Box>
    )}

    {/* RANGE BUTTONS */}
    <ButtonGroup>
      {["week", "month", "year"].map((key) => (
        <Button
          key={key}
          variant={selectedRange === key ? "contained" : "outlined"}
          onClick={() => setSelectedRange(key as any)}
        >
          {strings.timeExpressions[key]}
        </Button>
      ))}
    </ButtonGroup>
  </Box>
);

export default RangeControls;
