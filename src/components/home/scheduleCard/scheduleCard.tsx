import strings from "src/localization/strings";
import HomepageCard, { type CardProps } from "../../generics/homepageCard";
import { RenderSchedule } from "./renderSchecule";

/**
 * Schedule card for home page.
 *
 * Does not have it's own screen, but leads
 * user to their google calendar.
 *
 * @param props.hidden - Boolean indicating is card hidden
 * @param props.onToggleHidden - Functionality to hide/unhide card
 * @param props.editmode - Boolean indicating is editmode on
 * @returns
 */
const ScheduleCard = ({ hidden, onToggleHidden, editmode }: CardProps) => {
  const path = "https://calendar.google.com/";

  return (
    <HomepageCard
      title={strings.schedule.title}
      content={<RenderSchedule hidden={hidden} />}
      path={path}
      hidden={hidden}
      onToggleHidden={onToggleHidden}
      editmode={editmode}
    />
  );
};

export default ScheduleCard;
