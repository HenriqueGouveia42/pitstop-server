import { Sale } from "../entities/sale.js";

export interface ISaleRepository {
    saveSale(sale: Sale): Promise<void>;
    findSavedSaleById(sale_id: string): Promise<Sale>;
    updateSavedSale(sale: Sale): Promise<Sale>;
    listSavedSales(): Promise<Sale[]>;
    deleteSavedSaleById(sale_id: string): Promise<void>;
}
