import type { Bill } from "../entities/bill.js";

export interface BillRepository {
    saveBill(bill: Bill): Promise<void>;
    listSavedBills(): Promise<Bill[]>;
    updateSavedBill(bill: Bill): Promise<Bill>;
    findSavedBillById(bill_id: string): Promise<Bill>;
}
