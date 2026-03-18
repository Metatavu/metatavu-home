import type { TextMatchTransformer } from "@lexical/markdown";
import { parseImageMetadata } from "src/utils/image-style-utils";
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
    const { alt, size, alignment } = parseImageMetadata(altWithMeta);
    const imageNode = $createImageNode(src, alt, size, alignment);
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match"
};
