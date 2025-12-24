import type { Sale } from '../../../entities/sale.js';
import type { ISaleRepository } from '../../sale.repository.interface.js';

export class PrismaSaleRepository implements ISaleRepository {

    saveSale(sale: Sale): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findSavedSaleById(sale_id: string): Promise<Sale> {
        throw new Error("Method not implemented.");
    }
    updateSavedSale(sale: Sale): Promise<Sale> {
        throw new Error("Method not implemented.");
    }
    listSavedSales(): Promise<Sale[]> {
        throw new Error("Method not implemented.");
    }
    deleteSavedSaleById(sale_id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}