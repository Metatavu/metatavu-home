import { atom } from "jotai";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";

export const articleAtom = atom<ArticleMetadata[] | null>(null);
export const draftArticleAtom = atom<ArticleMetadata[] | null>(null);
export const tagsAtom = atom<string[]>([]);
