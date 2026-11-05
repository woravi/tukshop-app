import BlogArticle from "@/components/BlogArticle";
import { BLOG_ARTICLES } from "@/lib/blog-articles.mjs";

const article = BLOG_ARTICLES.find(item => item.slug === "post1");
export const metadata = { title: `${article.title} | TukShop`, description: article.excerpt };

export default function Page() {
  return <BlogArticle slug="post1" />;
}
