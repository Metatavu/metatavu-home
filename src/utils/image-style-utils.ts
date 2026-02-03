import type React from "react";

export type ImageSize = "small" | "medium" | "large" | "full";
export type ImageAlignment = "left" | "center" | "right";

export interface ParsedImageMetadata {
  alt: string;
  size: ImageSize;
  alignment: ImageAlignment;
}

/**
 * Parses image metadata from alt text in the format: "alt text|size|alignment"
 * @param altText - The raw alt text string that may contain metadata
 * @returns Parsed metadata with alt text, size, and alignment
 */
export const parseImageMetadata = (altText: string): ParsedImageMetadata => {
  const parts = altText.split("|");
  const alignment = (
    parts.length >= 3 ? parts.pop()?.trim() || "center" : "center"
  ) as ImageAlignment;
  const size = (parts.length >= 2 ? parts.pop()?.trim() || "medium" : "medium") as ImageSize;
  const alt = parts.join("|").trim() || "";

  return { alt, size, alignment };
};

/**
 * Gets the max width value for an image based on size
 * @param size - The image size
 * @returns The max width in pixels or percentage
 */
export const getImageMaxWidth = (size: ImageSize): string => {
  switch (size) {
    case "small":
      return "300px";
    case "medium":
      return "500px";
    case "large":
      return "700px";
    case "full":
      return "100%";
    default:
      return "500px";
  }
};

/**
 * Gets the container style for an image based on alignment and size
 * @param alignment - The image alignment
 * @param maxWidth - The max width of the image
 * @returns The CSS properties for the container
 */
export const getImageContainerStyle = (
  alignment: ImageAlignment,
  maxWidth: string
): React.CSSProperties => {
  switch (alignment) {
    case "left":
      return {
        float: "left",
        marginRight: "1.5rem",
        marginBottom: "1rem",
        maxWidth: maxWidth
      };
    case "right":
      return {
        float: "right",
        marginLeft: "1.5rem",
        marginBottom: "1rem",
        maxWidth: maxWidth
      };
    case "center":
      return {
        display: "block",
        margin: "1rem auto",
        maxWidth: maxWidth,
        clear: "both"
      };
    default:
      return {};
  }
};

/**
 * Applies image alignment styles directly to an HTMLElement
 * @param element - The HTML element to style
 * @param alignment - The image alignment
 */
export const applyImageAlignmentStyles = (
  element: HTMLElement,
  alignment: ImageAlignment
): void => {
  switch (alignment) {
    case "left":
      element.style.float = "left";
      element.style.marginRight = "1.5rem";
      element.style.marginBottom = "1rem";
      break;
    case "center":
      element.style.display = "block";
      element.style.margin = "1rem auto";
      element.style.clear = "both";
      break;
    case "right":
      element.style.float = "right";
      element.style.marginLeft = "1.5rem";
      element.style.marginBottom = "1rem";
      break;
  }
};
