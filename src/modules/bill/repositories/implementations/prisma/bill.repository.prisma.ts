import type { Bill } from "../../../entities/bill.js"
import type { IBillRepository } from "../../bill.repository.interface.js";

export class PrismaBillRepository implements IBillRepository {

    saveBill(bill: Bill): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findSavedBillById(bill_id: string): Promise<Bill> {
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