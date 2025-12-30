import type { Bill } from "../../../entities/bill.js"
import type { IBillRepository } from "../../bill.repository.interface.js";
import { prisma } from "../../../../../shared/infra/prisma.js"
import type { Product } from "../../../../product/entities/product.js";


export class PrismaBillRepository implements IBillRepository {

    private static entityToPrismaDataMapper(bill: Bill): any{
        return{
            bill_id: bill.bill_id,
            bill_code_gtin: bill.bill_code,
            status: bill.status,
            created_at: bill.createdAt,
            updated_at: bill.updatedAt,
        }
    }

    async saveBill(bill: Bill): Promise<void> {

        const entityToPrismaDataMapped = PrismaBillRepository.entityToPrismaDataMapper(bill);

        await prisma.bill.create({
            data: entityToPrismaDataMapped
        })
    }
    findSavedBillById(bill_id: string): Promise<Bill> {
        throw new Error("Method not implemented.");
    }
    findSavedBillByGtinCode(gtin_code: string): Promise<Bill> {
        throw new Error("Method not implemented.");
    }
    updateSavedBill(bill: Bill): Promise<Bill> {
        throw new Error("Method not implemented.");
    }
    listSavedBills(): Promise<Bill[]> {
        throw new Error("Method not implemented.");
    }
    deleteSavedBillById(bill_id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}