import { render, screen } from "@testing-library/react";
import React from "react";
import SprintViewScreen from "../src/components/screens/sprint-view-screen.tsx";

describe("Testing TaskStatusFilter", () => {
  it("Render the select component and allow selecting an option", async () => {
    render(<SprintViewScreen />);
    const selectElement = screen.queryByTestId("status-filter") as HTMLElement;
    expect(selectElement).toBeDefined();
    const options = screen.queryAllByRole("combobox");
    expect(options[0].textContent).toBe("All tasks");
  });
});
