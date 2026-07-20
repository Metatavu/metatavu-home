import strings from "src/localization/strings";
import HomepageCard, { type CardProps } from "../generics/homepageCard";
import SprintViewCardContent from "./sprint-view-card-content/user-sprint-view-card";

/**
 * Sprint view card component.
 *
 * @param props.hidden - Boolean indicating if the card is visible
 * @param props.onToggleHidden - Functionality for changing visibility
 *
 * @returns Sprintview card component
 */
const SprintViewCard = ({ hidden, onToggleHidden, editmode }: CardProps) => {
  const path = "/sprintview";

  return (
    <HomepageCard
      title={strings.sprint.sprintviewCardTitle}
      content={<SprintViewCardContent hidden={hidden} />}
      path={path}
      hidden={hidden}
      onToggleHidden={onToggleHidden}
      editmode={editmode}
    />
  );
};

export default SprintViewCard;
