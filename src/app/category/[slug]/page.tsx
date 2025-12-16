import { categories } from '@/data/products';
import CategoryPageClient from './CategoryPageClient';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <CategoryPageClient params={params} />;
}

// Generate static params for all category slugs
export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}