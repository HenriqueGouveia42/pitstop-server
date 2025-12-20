import { Decimal } from "decimal.js";

enum states_sales{
    CONCLUIDA,
    CANCELADA,
    ESTORNADA
}

export type SaleProps = {
    sale_id: string,
    user_id: string,
    created_at: string,
    updated_at: string,
    total_price: Decimal
    status: states_sales
}

export class Sale{

    private constructor (readonly props: SaleProps){}

    public static build(user_id: string, total_price: Decimal, status: states_sales){
        
        const now = new Date().toISOString();

        return new Sale({
            sale_id: crypto.randomUUID().toString(),
            user_id,
            created_at: now,
            updated_at: now,
            total_price,
            status
        })
    }
    //getters
    public getSaleId(){
        return this.props.sale_id;
    }

    public getUserId(){
        return this.props.user_id;
    }

    public getCreatedAt(){
        return this.props.created_at;
    }

    public getUpdatedAt(){
        return this.props.updated_at;
    }

    public getTotalPrice(){
        return this.props.total_price;
    }

    public getStatus(){
        return this.props.status;
    }

    //setters
    public setUpdatedNow(){
        this.props.updated_at = new Date().toISOString();
    }

}