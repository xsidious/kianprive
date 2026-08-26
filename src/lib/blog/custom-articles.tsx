import type { ComponentType } from "react";
import { ElectrolyteWaterRecipesArticle } from "@/components/blog/articles/ElectrolyteWaterRecipes";

export const CUSTOM_BLOG_ARTICLE_SLUGS = ["electrolyte-water-recipes"] as const;

export type CustomBlogArticleSlug = (typeof CUSTOM_BLOG_ARTICLE_SLUGS)[number];

const customArticleComponents: Record<CustomBlogArticleSlug, ComponentType> = {
  "electrolyte-water-recipes": ElectrolyteWaterRecipesArticle,
};

export function isCustomBlogArticle(slug: string): slug is CustomBlogArticleSlug {
  return CUSTOM_BLOG_ARTICLE_SLUGS.includes(slug as CustomBlogArticleSlug);
}

export function getCustomBlogArticleComponent(slug: string) {
  if (!isCustomBlogArticle(slug)) return null;
  return customArticleComponents[slug];
}
