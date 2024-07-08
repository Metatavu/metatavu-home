import { render, screen } from "@testing-library/react";
import SyncButton from "../src/components/layout/sync-button";

test("Sync button exists", () => {
  render(<SyncButton />);

  const element = screen.getByText("Sync");
  expect(element).toBeDefined();
});
