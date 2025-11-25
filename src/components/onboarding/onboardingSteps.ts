import strings from "src/localization/strings";

export type OnboardingStep = {
  selector: string;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center"
    | "center";
  title: string;
  content: string;
};

/**
 * Returns onboarding steps using the current language from strings
 */
export function getOnboardingSteps(): OnboardingStep[] {
  return [
    {
      title: strings.onboarding.welcomeTitle,
      content: strings.onboarding.welcomeContent,
      selector: "#home-screen",
      position: "top-center"
    },
    {
      title: strings.onboarding.balanceTitle,
      content: strings.onboarding.balanceContent,
      selector: "#balance-card"
    },
    {
      title: strings.onboarding.sprintTitle,
      content: strings.onboarding.sprintContent,
      selector: "#sprint-view-card"
    },
    {
      title: strings.onboarding.vacationsTitle,
      content: strings.onboarding.vacationsContent,
      selector: "#vacations-card"
    },
    {
      title: strings.onboarding.wikiTitle,
      content: strings.onboarding.wikiContent,
      selector: "#wiki-documentation-card"
    },
    {
      title: strings.onboarding.softwareTitle,
      content: strings.onboarding.softwareContent,
      selector: "#software-registry-card"
    },
    {
      title: strings.onboarding.questionnaireTitle,
      content: strings.onboarding.questionnaireContent,
      selector: "#questionnaires-card"
    },
    {
      title: strings.onboarding.doneTitle,
      content: strings.onboarding.doneContent,
      selector: "#onboarding-complete"
    }
  ];
}
