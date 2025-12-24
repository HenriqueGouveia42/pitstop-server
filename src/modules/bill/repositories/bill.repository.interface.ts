import type { Bill } from "../entities/bill.js";

export interface IBillRepository {
    saveBill(bill: Bill): Promise<void>;
    findSavedBillById(bill_id: string): Promise<Bill>;
    updateSavedBill(bill: Bill): Promise<Bill>;
    listSavedBills(): Promise<Bill[]>;
    deleteSavedBillById(bill_id: string): Promise<void>;
}
