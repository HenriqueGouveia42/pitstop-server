import type { Product } from '../../../entities/product.js';
import type { ProductRepository } from '../../product.repository.interface.js';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter });

export class PrismaProductRepository implements ProductRepository {

    async saveProduct(product: Product): Promise<void> {

        console.log("Salvando produto no banco de dados via Prisma...")

        const entityDataToRawPrismaData = {
            product_id: product.id,
            name: product.name,
            unit_price_in_reais: product.price,
            gtin_code: product.gtin,
            is_internal: product.isInternal,
            created_at: new Date(product.createdAt),
            updated_at: new Date(product.updatedAt)
        }

        await prisma.product.create({
            data: entityDataToRawPrismaData
        })
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
