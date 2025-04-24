import { DecoratorNode, type LexicalNode, type NodeKey, type SerializedLexicalNode, type Spread } from 'lexical';
import type { ReactNode } from 'react';

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    type: 'image';
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<ReactNode> {
  __src: string;
  __altText: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__key);
  }

  constructor(src: string, altText: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText } = serializedNode;
    return new ImageNode(src, altText);
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      type: 'image',
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.style.display = 'contents';
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
          display: 'block', 
          width: '100%',
          borderRadius: '15px'
        }}
      />
    );
  }

  getImageData() {
    return {altText: this.__altText, src: this.__src}
  }
}

export function $createImageNode(src: string, altText: string): ImageNode {
  return new ImageNode(src, altText);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}