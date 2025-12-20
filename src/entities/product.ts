import { Decimal } from 'decimal.js';

export type ProductProps = {
    product_id: string;
    name: string;
    created_at: string;
    updated_at: string;
    unit_price_in_reais: Decimal;
    gtin_code: string;
}

export class Product{
    private constructor(readonly props: ProductProps){}

    public static build(name: string, unit_price_in_reais: Decimal, gtin_code: string){

        const now: string = new Date().toISOString();

        return new Product({
            product_id: crypto.randomUUID().toString(),
            name,
            created_at: now,
            updated_at: now,
            unit_price_in_reais,
            gtin_code
        })
    }

    //getters
    public getProductId(){
        return this.props.product_id;
    }

    public getName(){
        return this.props.name;
    }

    public getUnitPriceInReais(){
        return this.props.unit_price_in_reais;
    }

    public getGtinCode(){
        return this.props.gtin_code;
    }

    public getCreatedAt(){
        return this.props.created_at;
    }

    public getUpdatedAt(){
        return this.props.updated_at;
    }

    //setters
    public setUpdatedNow(){
        this.props.updated_at = new Date().toISOString();
    }

    public setName(name: string){
        if (name.length > 100){
            throw new Error("Nome do produto não pode ultrapassar 100 caracteres")
        }
        this.props.name = name;
        this.setUpdatedNow();
    }

    public setUnitPriceInReais(price: Decimal){
        if(price.isNegative()){
            throw new Error("Preco unitario nao pode ser negativo")
        }
        this.props.unit_price_in_reais = price
    }
}

