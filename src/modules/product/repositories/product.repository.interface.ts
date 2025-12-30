import type { Product } from "../entities/product.js";

export interface ProductRepository {
    saveProduct(product: Product): Promise<void>;
    findSavedProductById(product_id: string): Promise<Product>;
    findSavedProductByGtinCode(gtin_code: string): Promise<Product>;
    updateSavedProduct(product: Product): Promise<Product>;
    listSavedProducts(active: boolean): Promise<Product[]>;
    deactivateSavedProductById(product_id: string): Promise<void>;
    activateSavedProductById(product_id: string): Promise<void>;
}