import type { TextMatchTransformer } from "@lexical/markdown";
import { $createImageNode, ImageNode } from "../nodes/image-node";

export const IMAGE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (node.getType() === "image") {
      const { altText, src } = (node as ImageNode).getImageData();
      return `![${altText}](${src})`;
    }
    return null;
  },
  importRegExp: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"(.*?)")?\)/,
  regExp: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"(.*?)")?\)/,
  replace: (textNode, match) => {
    const [, alt, src] = match;
    const imageNode = $createImageNode(src, alt);
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match"
};
