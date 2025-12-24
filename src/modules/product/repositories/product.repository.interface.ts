import type { Product } from "../entities/product.js";

export interface ProductRepository {
    saveProduct(product: Product): Promise<void>;
    findSavedProductById(product_id: string): Promise<Product>;
    updateSavedProduct(product: Product): Promise<Product>;
    listSavedProducts(): Promise<Product[]>;
    deleteSavedProductById(product_id: string): Promise<void>;
}