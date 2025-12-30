import { Decimal } from "decimal.js";

export enum SaleStatus {
    CONCLUIDA = "CONCLUIDA",
    CANCELADA = "CANCELADA",
    ESTORNADA = "ESTORNADA"
}

export enum PaymentMethod {
  PIX = "PIX",
  ESPECIE = "ESPECIE",
  CARTAO_DEBITO = "CARTAO_DEBITO",
  CARTAO_CREDITO = "CARTAO_CREDITO"
}

export type SalePaymentProp = { //representa um pagamento de uma determinada venda  fechada
    readonly sale_payment_id: string,
    readonly amount: Decimal,
    readonly method: PaymentMethod,
    readonly sale_id: string,
}

export type SaleProductProp = { //representa um produto numa venda fechada
    readonly sale_product_id: string,
    readonly quantity: number,
    readonly unit_price_sold: Decimal,

    readonly sale_id: string,
    readonly product_id: string,
    readonly origin_bill_id?: string //opcional pois o item da venda pode ter sido feito direto no balcao, ou seja, sem comanda
}

export type SaleProp = { //representa uma venda fechada
    readonly sale_id: string;
    readonly total_price: Decimal;
    readonly status: SaleStatus;
    readonly user_id: string;
    readonly created_at: string,
    readonly updated_at: string;

    readonly items: SaleProductProp[];
    readonly payments: SalePaymentProp[];
}


export class Sale {

    private constructor(private readonly props: SaleProp) {}

    private static validateTotals(totalAmountFromItems: Decimal, totalPaid: Decimal) {
        
        if (totalPaid.lessThan(totalAmountFromItems)) {
             throw new Error(`Pagamento menor do que o valor da conta. Total Venda: ${totalAmountFromItems}, Total Pago: ${totalPaid}`);
        }
    }

    public static buildSale( //venda fechada
        user_id: string,
        items: SaleProductProp[],      
        payments: SalePaymentProp[], // Recebe Input (sem ID)

    ): Sale {
        
        if (items.length === 0) {
            throw new Error("Não é possível criar uma venda sem itens.");
        }

        //o preco da venda é a soma dos itens
        const calculatedTotalPrice = items.reduce((acc, item) => {
            return acc.plus(item.unit_price_sold.times(item.quantity));
        }, new Decimal(0));

        //quanto foi pago
        const calculatedTotalPaid = payments.reduce((acc, pay) => {
            return acc.plus(pay.amount);
        }, new Decimal(0));

        //valida consistencia
        Sale.validateTotals(calculatedTotalPrice, calculatedTotalPaid);

        const now = new Date().toISOString();
        const newSaleId = crypto.randomUUID();

        return new Sale({
            sale_id: newSaleId,
            total_price: calculatedTotalPrice,
            status: SaleStatus.CONCLUIDA, //VENDA FECHADA!!
            user_id,
            created_at: now,
            updated_at: now,
            items,
            payments
        });
    }

    //getters
    get id() { return this.props.sale_id; }
    get userId() { return this.props.user_id; }
    get total() { return this.props.total_price; }
    get status() { return this.props.status; }
    get items() { return this.props.items; }
    get payments() { return this.props.payments; }

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