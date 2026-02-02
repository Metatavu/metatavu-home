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
    const alignment = (parts.length >= 3 ? parts.pop()?.trim() : "center") as "left" | "center" | "right";
    const size = (parts.length >= 2 ? parts.pop()?.trim() : "medium") as "small" | "medium" | "large" | "full";
    const alt = parts.join("|").trim() || "";
    const imageNode = $createImageNode(src, alt, size, alignment);
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match"
};
