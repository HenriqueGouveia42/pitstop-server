//CONTRATO QUE FAZ A CONECTA SERVICES, CONTROLLERS, ETC
//ÀS IMPLEMENTAÇÕES CONCRETAS

import type { Product } from "../entities/product.js";

export interface ProductRepository {
    saveProduct(product: Product): Promise<void>;
    listSavedProducts(): Promise<Product[]>;
    updateSavedProduct(product: Product): Promise<Product>;
    findSavedProductById(product_id: string): Promise<Product>;
}