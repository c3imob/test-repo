"use client";

import { create } from "zustand";

export type PostSection = "introduction" | "body" | "conclusion";

export type EditablePost = {
  id?: string;
  title: string;
  introduction: string;
  body: string;
  conclusion: string;
  keywords: string[];
  tone: string;
  audience: string;
  length: "short" | "medium" | "long";
  seo?: {
    keywordDensity: Record<string, number>;
    metaTitle: string;
    metaDescription: string;
    readability: string;
  };
};

type PostStore = {
  post: EditablePost | null;
  setPost: (post: EditablePost) => void;
  updateSection: (section: PostSection, value: string) => void;
};

export const usePostStore = create<PostStore>((set) => ({
  post: null,
  setPost: (post) => set({ post }),
  updateSection: (section, value) =>
    set((state) =>
      state.post
        ? {
            post: {
              ...state.post,
              [section]: value
            }
          }
        : state
    )
}));
