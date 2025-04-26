import { atom } from "jotai"
import type { ArticleMetadata } from "src/generated/homeLambdasClient";

export const articleAtom = atom<ArticleMetadata[]>([]);
export const draftArticleAtom = atom<ArticleMetadata[]>([]);