import type { FunctionComponent } from "react";
import { Grid, Box } from "@mui/material";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";
import AppCard from "./cards/AppCard";

/**
 * Props for the Content component.
 */
interface ContentProps {
  applications: SoftwareRegistry[];
  isGridView: boolean;
}

/**
 * Content component.
 *
 * This component is responsible for rendering logged in user software entries.
 * It uses the `AppCard` component for each software entry.
 *
 * @component
 * @param ContentProps The props for the Content component.
 * @returns The rendered Content component.
 */
const Content: FunctionComponent<ContentProps> = ({ applications, isGridView }) => {
  return isGridView ? (
    <Grid container spacing={2}>
      {applications.map((app) => (
        <Grid item key={app.id}>
          <AppCard
            id={app.id || ""}
            image={app.image}
            name={app.name}
            description={app.description}
            tags={app.tags || []}
            isGridView={true}
            url={""}
            createdBy={""}
          />
        </Grid>
      ))}
    </Grid>
  ) : (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {applications.map((app) => (
        <AppCard
          key={app.id}
          id={app.id || ""}
          image={app.image}
          name={app.name}
          description={app.description}
          tags={app.tags || []}
          isGridView={false}
          url={""}
          createdBy={""}
        />
      ))}
    </Box>
  );
};

export default Content;
