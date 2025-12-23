import { Decimal } from 'decimal.js';
import { Product } from './product.js';

//tipo de um item na comanda
export type BillItemProps = {
    readonly bill_item_id: string;
    readonly bill_id: string;
    readonly product_id: string;
    readonly quantity: number;
    readonly price_at_addition: Decimal;
}


enum billStates{
    ABERTA = "ABERTA",
    FECHADA = "FECHADA",
    CANCELADA = "CANCELADA"
}

//tipo da comanda em si
export type BillProps = {
    readonly bill_id: string;
    readonly bill_code: string; //comanda "1025", por exemplo, que será utilizada por diversos clientes
    readonly status: billStates;
    readonly created_at: string;
    readonly items: BillItemProps[]; //relacionamento com bill_items
}

export class Bill {
    //construtor privado para forçar o uso do builder
    private constructor(private readonly props: BillProps) {}

    private static validateGtin13Code(gtin: string){

        if(gtin.length != 13){
            throw new Error("Codigo GTIN-13 precisa 13 digitos")
        }

        //verificas se a string contém APENAS dígitos de 0 a 9
        if (!/^\d+$/.test(gtin)) {
            throw new Error("O código GTIN deve conter apenas números");
        }

        const startsWith202 = gtin.startsWith('202');

        if(!startsWith202){
            throw new Error("O código GTIN deve comecar com o prefixo de comanda: '202' ");
        }

        const lastNumber = Number(gtin.slice(-1));

        let sum: number = 0;
        let impar: boolean = true;

        for(let i = 0; i < 12; i++){

            let currentNumber = Number(gtin[i]);

            impar ?
            sum += currentNumber
            :
            sum += (3 * currentNumber);

            impar = !impar
        }

        sum = sum % 10;

        const expectedCheckNumber = (10 - sum) % 10;

        if(lastNumber != expectedCheckNumber){
            throw new Error("GTIN-13 invalido. Digito Verificador incorreto")
        }
    }

    public static buildBill(bill_code: string): Bill {

        Bill.validateGtin13Code(bill_code);

        const now = new Date().toISOString();

        return new Bill({
            bill_id: crypto.randomUUID().toString(),
            bill_code: bill_code,
            status: billStates.ABERTA,
            created_at: now,
            items: [] //inicia sem itens
        });
    }
    //getters para acesso seguro aos dados -- readonly permite apenas ler

    get bill_id() {return this.props.bill_id}
    get bill_code() {return this.props.bill_code}
    get status() {return this.props.status}
    get createdAt() {return this.props.created_at}
    get items() {return this.props.items}

    public withClosedBill(): Bill{

        if(this.props.status === billStates.FECHADA){
            throw new Error("Essa comanda já está fechada");
        }

        if(this.props.items.length === 0){
            throw new Error("Não pode fechar uma comanda sem itens")
        }

        return new Bill({
            ...this.props,
            status: billStates.FECHADA
        })
    }

    public withOpenedBill(): Bill{

        if (this.props.status == billStates.ABERTA){
            throw new Error("Essa comanda já está aberta")
        }

            
        if(this.props.items.length != 0){
            throw new Error("Essa comanda já está com itens pendentes")
        }

        return new Bill({
                ...this.props,
                status: billStates.ABERTA
            }
        )
    }

    public withNewProductAddedToBill(product: Product, quantity: number): Bill{

        //readonly bill_item_id: string;
        //readonly bill_id: string;
        //readonly product_id: string;
        //readonly quantity: number;
        //readonly price_at_addition: Decimal;

        if (quantity <= 0) throw new Error("A quantidade deve ser maior que zero.");
        if (this.props.status !== billStates.ABERTA) throw new Error("Não é possível adicionar itens a uma comanda que não está ABERTA.");
        
       const itemExists = this.props.items.some(item => item.product_id === product.id)

       const newItems = itemExists

       ? this.props.items.map(item => 
            item.product_id === product.id
            ?   {...item, quantity: item.quantity + quantity}
            :   item
       )
       :
        [...this.props.items, {
            bill_item_id: crypto.randomUUID(),
            bill_id: this.bill_id,
            product_id: product.id,
            quantity: quantity,
            price_at_addition: product.price
        }];

        return new Bill({...this.props, items: newItems});
    }

    public calculateTotalBillAmount(): Decimal {
        return this.props.items.reduce((acc, item) => {
            return acc.plus(item.price_at_addition.times(item.quantity));
        }, new Decimal(0));
    }
}