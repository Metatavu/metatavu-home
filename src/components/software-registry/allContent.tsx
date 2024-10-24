import type { FunctionComponent } from "react";
import { Grid } from "@mui/material";
import type { SoftwareRegistry, SoftwareStatus } from "src/generated/homeLambdasClient";
import MainCard from "./cards/mainCard";

/**
 * Props for the Content component.
 */
interface ContentProps {
  applications: SoftwareRegistry[];
  isGridView: boolean;
  onStatusChange: (id: string, newStatus: SoftwareStatus) => void;
  adminMode: boolean;
  onSave: (id: string) => void;
  onRemove: (id: string) => void;
  loggedUserId: string;
}

/**
 * Content component.
 * 
 * This component is responsible for rendering the layout of software entries. 
 * It uses the `MainCard` component for each software entry and allows for admin actions 
 * such as changing the status or removing software.
 *
 * @component
 * @param ContentProps The props for the Content component.
 * @returns The rendered Content component.
 */
const Content: FunctionComponent<ContentProps> = ({
  applications,
  isGridView,
  onStatusChange,
  adminMode,
  onRemove,
  onSave,
  loggedUserId,
}) => {
  return (
    <Grid container spacing={2}>
      {applications.map((app) => {
        const isInMyApplications = app.users?.includes(loggedUserId) || false;
        
        return (
          <Grid item key={app.id}>
            <MainCard
              id={app.id || ""}
              image={app.image}
              name={app.name}
              description={app.description}
              tags={app.tags || []}
              status={app.status}
              isGridView={isGridView}
              isAdmin={adminMode}
              onStatusChange={
                adminMode ? 
                (newStatus) => 
                  onStatusChange( app.id || "", newStatus ) : undefined
              }
              onSave={() => onSave(app.id || "")}
              onRemove={adminMode ? () => onRemove(app.id || "") : undefined}
              isInMyApplications={isInMyApplications} 
              url={""} 
              createdBy={""}
              />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Content;
