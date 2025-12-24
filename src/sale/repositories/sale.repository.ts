import { Sale } from "../entities/sale.js";

export interface SaleRepository {
    saveSale(sale: Sale): Promise<void>;
    listSavedBills(): Promise<Sale[]>;
    updateSavedSale(sale: Sale): Promise<Sale>;
    findSavedSaleById(sale_id: string): Promise<Sale>;
}
