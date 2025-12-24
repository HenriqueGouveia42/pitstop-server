import type { Product } from '../../../entities/product.js';
import type { ProductRepository } from '../../product.repository.interface.js';

export class PrismaProductRepository implements ProductRepository {

    saveProduct(product: Product): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findSavedProductById(product_id: string): Promise<Product> {
        throw new Error("Method not implemented.");
    }
    updateSavedProduct(product: Product): Promise<Product> {
        throw new Error("Method not implemented.");
    }
    listSavedProducts(): Promise<Product[]> {
        throw new Error("Method not implemented.");
    }
    deleteSavedProductById(product_id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
