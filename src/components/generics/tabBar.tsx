import { Box, Tab as MuiTab, Tabs, useTheme } from "@mui/material";

export interface Tab {
  id: string;
  title: string;
}

interface TabProps {
  switchTab: (action: string) => void;
  chosenTab: string;
  tabNames: Tab[];
}

/**
 * Styled tab bar for navigating pages in screens.
 *
 * @param props.switchTab - Functionality for switching tabs
 * @param props.chosenTab - String id of the tab chosen
 * @param props.tabNames - Array of the tabs
 *
 * @returns Styled component for switching tabs
 */
const TabBar = ({ switchTab, chosenTab, tabNames }: TabProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: theme.spaces.l }}>
      <Tabs
        value={chosenTab}
        onChange={(_, value: string) => switchTab(value)}
        sx={{
          minHeight: 0,
          "& .MuiTabs-indicator": {
            height: 3,
            backgroundColor: theme.palette.text.accent
          }
        }}
      >
        {tabNames.map((tab) => (
          <MuiTab
            key={tab.id}
            value={tab.id}
            label={tab.title}
            sx={{
              minHeight: 0,
              minWidth: 0,
              pb: theme.spaces.s,
              marginRight: theme.spaces.m,
              typography: "body",
              fontWeight: 500,
              textTransform: "none",
              color: theme.palette.text.secondary,
              "&.Mui-selected": {
                color: theme.palette.text.accent
              },
              "&:hover": {
                textDecoration: "none"
              }
            }}
          />
        ))}
      </Tabs>

      <Box
        sx={{
          height: "1px",
          maxWidth: 1100,
          backgroundColor: theme.palette.text.secondary
        }}
      />
    </Box>
  );
};

export default TabBar;
