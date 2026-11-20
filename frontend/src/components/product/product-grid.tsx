import { ProductTile, type ProductTileProps } from "./product-tile";

const gridClassName = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";

export function ProductGrid({ products }: { products: ProductTileProps[] }) {
  return (
    <ul className={gridClassName}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductTile {...product} />
        </li>
      ))}
    </ul>
  );
}

export { gridClassName };
