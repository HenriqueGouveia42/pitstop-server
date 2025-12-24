import { Decimal } from "decimal.js";

//enums e types
export enum PaymentMethod {
    PIX = "PIX",
    ESPECIE = "ESPECIE",
    CARTAO_DEBITO = "CARTAO_DEBITO",
    CARTAO_CREDITO = "CARTAO_CREDITO"
}

export enum SaleStatus {
    CONCLUIDA = "CONCLUIDA",
    CANCELADA = "CANCELADA",
    ESTORNADA = "ESTORNADA"
}
//
//
//
//
//
// output DTO's
export type SaleItemOutputDTO = {
    readonly sale_product_id: string;
    readonly product_id: string;
    readonly quantity: number;
    readonly unit_price_sold: Decimal;
    readonly cameFromBill: boolean;
}
export type SalePaymentOutputDTO = {
    readonly sale_payment_id: string;
    readonly method: PaymentMethod;
    readonly amount: Decimal;
}
//
//
//
//
//
// input DTO's
export type SaleItemInputDTO = {
    readonly product_id: string;
    readonly quantity: number;
    readonly unit_price_sold: Decimal;
    readonly cameFromBill: boolean;
}
export type SalePaymentInputDTO = {
    readonly method: PaymentMethod;
    readonly amount: Decimal;
}
export type SaleProp = {
    readonly sale_id: string;
    readonly user_id: string;
    readonly origin_bill_id: string | null;
    readonly created_at: string,
    readonly updated_at: string;
    readonly status: SaleStatus;
    readonly total_price: Decimal;
    readonly items: SaleItemOutputDTO[];
    readonly payments: SalePaymentOutputDTO[];
}
//
//
//
//
//
export class Sale {

    private constructor(private readonly props: SaleProp) {}

    private static validateTotals(totalItems: Decimal, totalPaid: Decimal) {
        
        if (totalPaid.lessThan(totalItems)) {
             throw new Error(`Pagamento menor do que o valor da conta. Total Venda: ${totalItems}, Total Pago: ${totalPaid}`);
        }
    }

    public static buildSale(
        user_id: string,
        itemsInput: SaleItemInputDTO[],       // Recebe Input (sem ID)
        paymentsInput: SalePaymentInputDTO[], // Recebe Input (sem ID)
        origin_bill_id?: string
    ): Sale {
        
        if (itemsInput.length === 0) {
            throw new Error("Não é possível criar uma venda sem itens.");
        }

        //o preco da venda é a soma dos itens
        const calculatedTotalPrice = itemsInput.reduce((acc, item) => {
            return acc.plus(item.unit_price_sold.times(item.quantity));
        }, new Decimal(0));

        //quanto foi pago
        const calculatedTotalPaid = paymentsInput.reduce((acc, pay) => {
            return acc.plus(pay.amount);
        }, new Decimal(0));

        //valida consistencia
        Sale.validateTotals(calculatedTotalPrice, calculatedTotalPaid);

        const now = new Date().toISOString();

        const newSaleId = crypto.randomUUID();

        const itemsProps: SaleItemOutputDTO[] = itemsInput.map(item => ({
            sale_product_id: crypto.randomUUID(),
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price_sold: item.unit_price_sold,
            cameFromBill: item.cameFromBill
        }));

        const paymentsProps: SalePaymentOutputDTO[] = paymentsInput.map(pay => ({
            sale_payment_id: crypto.randomUUID(),
            method: pay.method,
            amount: pay.amount
        }));

        return new Sale({
            sale_id: newSaleId,
            user_id,
            origin_bill_id: origin_bill_id || null,
            created_at: now,
            updated_at: now,
            status: SaleStatus.CONCLUIDA,
            total_price: calculatedTotalPrice,
            items: itemsProps,
            payments: paymentsProps
        });
    }

    //getters
    get id() { return this.props.sale_id; }
    get userId() { return this.props.user_id; }
    get total() { return this.props.total_price; }
    get status() { return this.props.status; }
    get items() { return this.props.items; }
    get payments() { return this.props.payments; }
    get originBillId() { return this.props.origin_bill_id; }

    public withCancelledStatus(): Sale {
        if (this.props.status !== SaleStatus.CONCLUIDA) {
            throw new Error("Apenas vendas concluídas podem ser canceladas.");
        }
        
        return new Sale({
            ...this.props,
            status: SaleStatus.CANCELADA,
            updated_at: new Date().toISOString()
        });
    }
}