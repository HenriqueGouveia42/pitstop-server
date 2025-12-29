import { Product, type ProductProps } from '../../../entities/product.js';
import type { ProductRepository } from '../../product.repository.interface.js';

import { prisma } from "../../../../../shared/infra/prisma.js"


export class PrismaProductRepository implements ProductRepository {

    private static prismaToEntityDataMapper(prismaProduct: any): Product {

        const productProps: ProductProps = {
            product_id: prismaProduct.product_id,
            name: prismaProduct.name,
            created_at: prismaProduct.created_at.toISOString(),
            updated_at: prismaProduct.updated_at.toISOString(),
            unit_price_in_reais: prismaProduct.unit_price_in_reais,
            gtin_code: prismaProduct.gtin_code,
            is_internal: prismaProduct.is_internal
        }

        return Product.restoreProduct(productProps);
    }

    private static entityToPrismaDataMapper(product: Product): any {
        return {
            product_id: product.id,
            name: product.name,
            unit_price_in_reais: product.price,
            gtin_code: product.gtin,
            is_internal: product.isInternal,
            created_at: new Date(product.createdAt),
            updated_at: new Date(product.updatedAt)
        }
    }

    async saveProduct(product: Product): Promise<void> {

        const entityToPrismaDataMapped = PrismaProductRepository.entityToPrismaDataMapper(product);

        await prisma.product.create({
            data: entityToPrismaDataMapped
        })
    }

    async findSavedProductById(product_id: string): Promise<Product> {

        const prismaProduct = await prisma.product.findUnique({
            where:{product_id: product_id}
        })

        if(!prismaProduct){
            throw new Error("Produto não encontrado");
        }

        const productMapped: Product = PrismaProductRepository.prismaToEntityDataMapper(prismaProduct);

        return productMapped;
    }

    async updateSavedProduct(product: Product): Promise<Product> {

        const mappedToPrisma = PrismaProductRepository.entityToPrismaDataMapper(product);

        //remover id e created_at do objeto que será enviado para o 'data'
        const { product_id, created_at, ...dataToUpdate } = mappedToPrisma;

        const updatedProduct = await prisma.product.update({
            where:{
                product_id: product.id
            },
            data:{
                ...dataToUpdate
            }
        })

        const mappedToEntity: Product = PrismaProductRepository.prismaToEntityDataMapper(updatedProduct);

        return mappedToEntity;
    }

    async listSavedProducts(): Promise<Product[]> {

        const prismaSavedProducts = await prisma.product.findMany();

        if (prismaSavedProducts.length === 0){
            return [];
        }

        return prismaSavedProducts.map(prismaProduct => 
            PrismaProductRepository.prismaToEntityDataMapper(prismaProduct)
        );
    }

    deleteSavedProductById(product_id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
