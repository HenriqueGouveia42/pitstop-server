import { Decimal } from 'decimal.js';
import crypto from 'crypto';

// Tipagem para os itens da comanda (conforme DBML)
export type BillItemProps = {
    bill_item_id: string;
    bill_id: string;
    product_id: string;
    quantity: number;
    price_at_addition: Decimal;
}

// Tipagem para a Comanda (conforme DBML)
export type BillProps = {
    bill_id: string;
    bill_code: string;
    is_active: boolean;
    created_at: string;
    items: BillItemProps[]; // Relacionamento com bill_items
}

export class Bill {
    // Construtor privado para forçar o uso do builder
    private constructor(readonly props: BillProps) {}

    /**
     * Cria uma nova comanda (Builder)
     * @param bill_code O código físico do papelzinho (ex: "1042")
     */
    public static build(bill_code: string): Bill {
        if (!bill_code || bill_code.trim() === "") {
            throw new Error("O código da comanda é obrigatório.");
        }

        const now = new Date().toISOString();

        return new Bill({
            bill_id: crypto.randomUUID().toString(),
            bill_code: bill_code,
            is_active: true,
            created_at: now,
            items: [] // Inicia sem itens
        });
    }

    /**
     * Regra de Negócio: Adicionar produto à comanda
     * Aqui "congelamos" o preço do produto no momento da adição.
     */
    public addItem(product_id: string, quantity: number, unit_price: Decimal): void {
        if (!this.props.is_active) {
            throw new Error("Não é possível adicionar itens a uma comanda que já foi fechada.");
        }

        if (quantity <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        // Se o produto já existe na comanda, apenas somamos a quantidade
        const existingItem = this.props.items.find(item => item.product_id === product_id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            // Se é um item novo, criamos o objeto bill_item
            const newItem: BillItemProps = {
                bill_item_id: crypto.randomUUID().toString(),
                bill_id: this.props.bill_id,
                product_id: product_id,
                quantity: quantity,
                price_at_addition: unit_price
            };
            this.props.items.push(newItem);
        }
    }

    /**
     * Regra de Negócio: Fecha a comanda para pagamento
     */
    public close(): void {
        if (this.props.items.length === 0) {
            throw new Error("Não é possível fechar uma comanda sem itens.");
        }
        this.props.is_active = false;
    }

    // Getters conforme os nomes do banco de dados
    public getBillId(): string {
        return this.props.bill_id;
    }

    public getBillCode(): string {
        return this.props.bill_code;
    }

    public getIsActive(): boolean {
        return this.props.is_active;
    }

    public getCreatedAt(): string {
        return this.props.created_at;
    }

    public getItems(): BillItemProps[] {
        // Retorna uma cópia para proteger a integridade da lista original
        return [...this.props.items];
    }

    /**
     * Calcula o valor total atual da comanda
     */
    public calculateTotal(): Decimal {
        return this.props.items.reduce((acc, item) => {
            return acc.plus(item.price_at_addition.times(item.quantity));
        }, new Decimal(0));
    }
}