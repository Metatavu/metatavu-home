import type { FunctionComponent } from 'react';
import { Grid } from '@mui/material';
import type { SoftwareRegistry } from 'src/generated/homeLambdasClient';
import AppCard from './cards/AppCard';

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
  return (
    <Grid container spacing={2}>
      {applications.map((app, index) => (
        <Grid
          item
          key={index} 
        >
          <AppCard
            id={app.id || ''}
            image={app.image}
            name={app.name}
            description={app.description}
            tags={app.tags || []}
            isGridView={isGridView} 
            url={''}
            createdBy={''}
            />
        </Grid>
      ))}
    </Grid>
  );
};

export default Content;
