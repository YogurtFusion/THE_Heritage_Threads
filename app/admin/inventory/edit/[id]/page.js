import EditProductForm from "@/sections/admin/Inventory/EditProductForm";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  return <EditProductForm id={id} />;
}
