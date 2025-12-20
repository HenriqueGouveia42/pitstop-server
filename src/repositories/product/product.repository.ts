//CONTRATO QUE FAZ A CONECTA SERVICES, CONTROLLERS, ETC
//ÀS IMPLEMENTAÇÕES CONCRETAS

import type { Product } from "../../entities/product.js";

export interface ProductRepository {
    createNewProduct(product: Product): Promise<void>;
    listCreatedProducts(): Promise<Product[]>;
    updateProduct(product: Product): Promise<Product>;
    findProductById(product_id: string): Promise<Product>;
}