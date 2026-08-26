import { Box, useTheme } from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";
import AppButton from "./buttons/app-button";

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
  const chosenIndex = tabNames.findIndex((tab) => tab.id === chosenTab);
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0
  });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const activeButton = tabRefs.current[chosenIndex];
    const firstButton = tabRefs.current[0];

    if (!activeButton || !firstButton) {
      return;
    }

    setIndicator({
      left: activeButton.offsetLeft - firstButton.offsetLeft,
      width: activeButton.offsetWidth
    });
  }, [chosenIndex, tabNames]);

  return (
    <Box sx={{ mb: theme.spaces.l }}>
      <Box sx={{ display: "flex" }}>
        {tabNames.map((tab, index) => (
          <Box
            key={tab.id}
            ref={(el: HTMLDivElement | null) => {
              tabRefs.current[index] = el;
            }}
          >
            <AppButton
              variant="borderless"
              text={tab.title}
              onClick={() => switchTab(tab.id)}
              sx={{
                fontWeight: 500,
                color:
                  tab.id === chosenTab ? theme.palette.text.accent : theme.palette.text.secondary,
                "&:hover": {
                  textDecoration: "none"
                }
              }}
            />
          </Box>
        ))}
      </Box>

      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            height: "1px",
            maxWidth: 1100,
            backgroundColor: theme.palette.text.secondary
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: -2,
            left: indicator.left,
            width: indicator.width,
            height: 3,
            backgroundColor: theme.palette.text.accent
          }}
        />
      </Box>
    </Box>
  );
};

export default TabBar;
