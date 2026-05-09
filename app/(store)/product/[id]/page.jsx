import ProductDetail from "@/sections/product/ProductDetail";

export default async function ProductPage({ params }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
