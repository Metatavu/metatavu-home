import { render, screen } from "@testing-library/react";
import SprintViewScreen from "../src/components/screens/sprint-view-screen";
import React from "react";

describe("testing sprint view screen", () => {
  describe("projects card component", () => {
    it("Check projects card rendering", async () => {
      render(<SprintViewScreen />);
      const element = screen.getByTestId("project-card");
      expect(element).toBeDefined();
    });
  });
  describe("tasks card component", () => {
    it("Check tasks card rendering", async () => {
      render(<SprintViewScreen />);
      const element = screen.getByTestId("allocation-table");
      expect(element).toBeDefined();
    });
  });
});
