import { Decimal } from "decimal.js";
import { Bill } from "./bill.js";

enum states_sales{
    CONCLUIDA,
    CANCELADA,
    ESTORNADA
}

export type SaleProps = {
    readonly sale_id: string,
    readonly user_id: string,
    readonly created_at: string,
    readonly updated_at: string,
    readonly total_price: Decimal
    readonly status: states_sales
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
    get id(){ return this.props.sale_id; }
    get user_id(){ return this.props.user_id; }
    get created_at(){ return this.props.created_at; }
    get updated_at(){ return this.props.updated_at; }
    get total_price(){ return this.props.total_price; }
    get status(){ return this.props.status; }
    
    //setters
    public setUpdatedNow(){
        this.props.updated_at = new Date().toISOString();
    }

}