import type { TextMatchTransformer } from "@lexical/markdown";
import { $createImageNode, ImageNode } from "../nodes/image-node";

export const IMAGE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (node.getType() === "image") {
      const { altText, src, size, alignment } = (node as ImageNode).getImageData();
      return `![${altText}|${size}|${alignment}](${src})`;
    }
    return null;
  },
  importRegExp: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"(.*?)")?\)/,
  regExp: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"(.*?)")?\)/,
  replace: (textNode, match) => {
    const [, altWithMeta, src] = match;
    const parts = altWithMeta.split("|");
    const alt = parts[0] || "";
    const size = (parts[1] || "medium") as "small" | "medium" | "large" | "full";
    const alignment = (parts[2] || "center") as "left" | "center" | "right";
    const imageNode = $createImageNode(src, alt, size, alignment);
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match"
};
