import strings from "src/localization/strings";

export type OnboardingStep = {
  selector: string;
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center" | "center";
  title: string;
  content: string;
};

export const onboardingSteps = [
  {
    title: "Welcome to the Home Screen",
    content: "This is your dashboard where you can see your balance, sprints, and more.",
    selector: "#home-screen",
    position: "top-center", 
  },
  {
    title: "Check your Balance",
    content: "This card shows your total flextime balance.",
    selector: "#balance-card",
  },
  {
    title: "View Sprint Progress",
    content: "Track ongoing sprints and deadlines here.",
    selector: "#sprint-view-card",
  },
  {
    title: "Manage Vacations",
    content: "Request and manage your vacation days easily.",
    selector: "#vacations-card",
  },
  {
    title: "Access Wiki Documentation",
    content: "Find helpful resources and documentation here.",
    selector: "#wiki-documentation-card",
  },
  {
    title: "Software Registry",
    content: "Browse and manage software used in your projects.",
    selector: "#software-registry-card",
  },
  {
    title: "Complete the Onboarding",
    content: "Finish the onboarding process to get started.",
    selector: "#onboarding-complete",
  },
];
