import {
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread
} from "lexical";
import type { ReactNode } from "react";

export type ImageSize = "small" | "medium" | "large" | "full";
export type ImageAlignment = "left" | "center" | "right";

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    size: ImageSize;
    alignment: ImageAlignment;
    type: "image";
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<ReactNode> {
  __src: string;
  __altText: string;
  __size: ImageSize;
  __alignment: ImageAlignment;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__size, node.__alignment, node.__key);
  }

  constructor(src: string, altText: string, size: ImageSize = "medium", alignment: ImageAlignment = "center", key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__size = size;
    this.__alignment = alignment;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, size, alignment } = serializedNode;
    return new ImageNode(src, altText, size || "medium", alignment || "center");
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      size: this.__size,
      alignment: this.__alignment,
      type: "image",
      version: 1
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    
    const maxWidth = (() => {
      switch (this.__size) {
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
    })();
    
    div.style.maxWidth = maxWidth;
    
    switch (this.__alignment) {
      case "left":
        div.style.float = "left";
        div.style.marginRight = "1.5rem";
        div.style.marginBottom = "1rem";
        break;
      case "center":
        div.style.display = "block";
        div.style.margin = "1rem auto";
        div.style.clear = "both";
        break;
      case "right":
        div.style.float = "right";
        div.style.marginLeft = "1.5rem";
        div.style.marginBottom = "1rem";
        break;
    }
    
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): ReactNode {
    return (
      <img
        src={this.__src}
        alt={this.__altText}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          objectFit: "contain",
          borderRadius: "15px"
        }}
      />
    );
  }

  getImageData() {
    return { 
      altText: this.__altText, 
      src: this.__src,
      size: this.__size,
      alignment: this.__alignment
    };
  }
}

export function $createImageNode(src: string, altText: string, size: ImageSize = "medium", alignment: ImageAlignment = "center"): ImageNode {
  return new ImageNode(src, altText, size, alignment);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
