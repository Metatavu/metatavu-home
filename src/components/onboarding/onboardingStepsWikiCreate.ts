import strings from "src/localization/strings";

/**
 * Type definition for an onboarding step
 */
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
 * Returns onboarding steps for Wiki Article Creation Form using the current language from strings
 *
 * @returns An array of onboarding steps that guide users through the article creation process
 */
export function getWikiCreateOnboardingSteps(): OnboardingStep[] {
  return [
    {
      title: strings.onboardingWikiCreate.welcomeTitle,
      content: strings.onboardingWikiCreate.welcomeContent,
      selector: "#wiki-create-form-container",
      position: "center"
    },
    {
      title: strings.onboardingWikiCreate.titleFieldTitle,
      content: strings.onboardingWikiCreate.titleFieldContent,
      selector: "#wiki-article-title-field",
      position: "bottom-left"
    },
    {
      title: strings.onboardingWikiCreate.pathFieldTitle,
      content: strings.onboardingWikiCreate.pathFieldContent,
      selector: "#wiki-article-path-field",
      position: "bottom-left"
    },
    {
      title: strings.onboardingWikiCreate.tagsFieldTitle,
      content: strings.onboardingWikiCreate.tagsFieldContent,
      selector: "#wiki-article-tags-field",
      position: "bottom-right"
    },
    {
      title: strings.onboardingWikiCreate.imageFieldTitle,
      content: strings.onboardingWikiCreate.imageFieldContent,
      selector: "#wiki-article-image-field",
      position: "bottom-left"
    },
    {
      title: strings.onboardingWikiCreate.descriptionFieldTitle,
      content: strings.onboardingWikiCreate.descriptionFieldContent,
      selector: "#wiki-article-description-field",
      position: "bottom-right"
    },
    {
      title: strings.onboardingWikiCreate.editorTitle,
      content: strings.onboardingWikiCreate.editorContent,
      selector: "#wiki-article-content-editor",
      position: "top-center"
    },
    {
      title: strings.onboardingWikiCreate.editorLinksTitle,
      content: strings.onboardingWikiCreate.editorLinksContent,
      selector: "#wiki-editor-link-button",
      position: "bottom-center"
    },
    {
      title: strings.onboardingWikiCreate.editorArticleLinksTitle,
      content: strings.onboardingWikiCreate.editorArticleLinksContent,
      selector: "#wiki-editor-article-link-button",
      position: "bottom-center"
    },
    {
      title: strings.onboardingWikiCreate.editorImagesTitle,
      content: strings.onboardingWikiCreate.editorImagesContent,
      selector: "#wiki-editor-image-button",
      position: "bottom-center"
    },
    {
      title: strings.onboardingWikiCreate.actionButtonTitle,
      content: strings.onboardingWikiCreate.actionButtonContent,
      selector: "#wiki-article-action-button",
      position: "bottom-center"
    }
  ];
}
