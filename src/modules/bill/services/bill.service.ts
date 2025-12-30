import { Bill } from "../entities/bill.js";
import { PrismaBillRepository } from "../repositories/implementations/prisma/bill.repository.prisma.js";
import { Product } from "../../product/entities/product.js";
import { PrismaProductRepository } from "../../product/repositories/implementations/prisma/product.repository.prisma.js";
// Removi User fetch se não essencial; adicione se necessário

export class BillService {
    
    private billRep: PrismaBillRepository;
    private productRep: PrismaProductRepository;

    constructor() {
        this.billRep = new PrismaBillRepository();
        this.productRep = new PrismaProductRepository();
    }

    async addProductToBill(bill_code_gtin: string, product_gtin_code: string, quantity: number, user_id: string): Promise<Bill> {

        const bill: Bill = await this.billRep.findSavedBillByGtinCode(bill_code_gtin);
        if (!bill) {
            throw new Error(`Comanda de codigo ${bill_code_gtin} não encontrada`);
        }

        const product: Product = await this.productRep.findSavedProductByGtinCode(product_gtin_code);
        if (!product) {
            throw new Error(`Produto de gtin_code ${product_gtin_code} não encontrado`);
        }

        // Se validar user for essencial, adicione fetch aqui; senão, use user_id diretamente
        const billWithAddedProduct: Bill = bill.withNewProductAddedToBill(product, quantity, user_id);

        // Persista a atualização
        const updatedBill: Bill = await this.billRep.updateSavedBill(billWithAddedProduct);

        return updatedBill;
    }
}