import strings from "src/localization/strings";
import SegmentedControl from "../generics/segmented-control";

type RangeKey = "week" | "month" | "year";

interface RangeTypeSelectorProps {
  selectedRange: RangeKey;
  onChange: (range: RangeKey) => void;
}

/**
 * Week / Month / Year segmented control for the balance chart.
 */
const RangeTypeSelector = ({
  selectedRange,
  onChange,
}: RangeTypeSelectorProps) => (
  <SegmentedControl<RangeKey>
    value={selectedRange}
    onChange={onChange}
    ariaLabel={strings.timebank.selectTimespan}
    options={[
      { value: "week", label: strings.timeExpressions.week },
      { value: "month", label: strings.timeExpressions.month },
      { value: "year", label: strings.timeExpressions.year },
    ]}
  />
);

export default RangeTypeSelector;
