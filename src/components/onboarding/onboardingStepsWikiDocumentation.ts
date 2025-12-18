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
 * Returns onboarding steps for Wiki Documentation using the current language from strings
 */
export function getWikiOnboardingSteps(): OnboardingStep[] {
  return [
    {
      title: strings.onboardingWikiDocumentation.welcomeWikiTitle,
      content: strings.onboardingWikiDocumentation.welcomeWikiContent,
      selector: "#wiki-card-title",
      position: "top-center"
    },
    {
      title: strings.onboardingWikiDocumentation.latestUpdatedArticlesTitle,
      content: strings.onboardingWikiDocumentation.latestUpdatedArticlesContent,
      selector: "#wiki-latest-updated-articles",
      position: "top-center"
    },
    {
      title: strings.onboardingWikiDocumentation.wikiSearchBarTitle,
      content: strings.onboardingWikiDocumentation.wikiSearchBarContent,
      selector: "#wiki-article-search-bar",
      position: "top-left"
    },
    {
      title: strings.onboardingWikiDocumentation.createArticleTitle,
      content: strings.onboardingWikiDocumentation.createArticleContent,
      selector: "#wiki-create-article-button",
      position: "top-right"
    },
    {
      title: strings.onboardingWikiDocumentation.listOfArticlesTitle,
      content: strings.onboardingWikiDocumentation.listOfArticlesContent,
      selector: "#wiki-articles-list",
      position: "center"
    }
  ];
}
