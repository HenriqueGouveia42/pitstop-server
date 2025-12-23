import { Decimal } from 'decimal.js';

export type ProductProps = {
    readonly product_id: string;
    readonly name: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly unit_price_in_reais: Decimal;
    readonly gtin_code: string;
    readonly is_internal: boolean;
}

export class Product {
    //constructor e propriedade props são estritamente readonly
    private constructor(private readonly props: ProductProps) {}

    private static validateGtin13Code(gtin: string, is_internal: boolean){

        if(gtin.length != 13){
            throw new Error("Codigo GTIN-13 precisa 13 digitos")
        }

        //verificas se a string contém APENAS dígitos de 0 a 9
        if (!/^\d+$/.test(gtin)) {
            throw new Error("O código GTIN deve conter apenas números");
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

        const startsWith200 = gtin.startsWith('200');

        if( startsWith200 !== is_internal){
            throw new Error("GTIN-13 code não corresponde ao status 'is_internal'. Produtos internos começam com '200'")
        }

        const startsWith202 = gtin.startsWith('202');

        if (startsWith202){
            throw new Error("Um produto nao pode comecar com '202', pois esse prefixo é reservado para comandas")
        }

    }

    private static validateName(name: string) {
        if (name.length > 100) throw new Error("Nome muito longo");
    }

    private static validatePrice(price: Decimal) {
        if (price.isNegative() || price.gt(1000000)) throw new Error("Preço fora da faixa permitida");
    }

    public static buildProduct(
        name: string, 
        unit_price_in_reais: Decimal, 
        gtin_code: string, 
        is_internal: boolean
    ): Product {

       
        Product.validateGtin13Code(gtin_code, is_internal);
        Product.validateName(name);
        Product.validatePrice(unit_price_in_reais);

        const now = new Date().toISOString();

        return new Product({
            product_id: crypto.randomUUID(),
            name,
            created_at: now,
            updated_at: now,
            unit_price_in_reais,
            gtin_code,
            is_internal
        });
    }

    //getters para acesso seguro aos dados -- readonly permite apenas ler
    get id() { return this.props.product_id; }
    get name() { return this.props.name; }
    get price() { return this.props.unit_price_in_reais; }
    get gtin() { return this.props.gtin_code; }
    get isInternal() { return this.props.is_internal; }
    get updatedAt() { return this.props.updated_at; }

   
    //esses metodos substituem os setters. cada um deles retorna um novo objeto, com aquela propriedade alterada

    //retorna nova instancia de Product apenas com o nome alterado
    public withName(newName: string): Product {

        Product.validateName(newName);

        return new Product({
            ...this.props, //copia os dados atuais
            name: newName,  //sbrescreve apenas o nome
            updated_at: new Date().toISOString() // Atualiza o timestamp
        });
    }

    //retorna uma nova instancia de Product apenas com o preco alterado
    public withUnitPrice(newPrice: Decimal): Product {

        Product.validatePrice(newPrice);

        return new Product({
            ...this.props,
            unit_price_in_reais: newPrice,
            updated_at: new Date().toISOString()
        });
    }
}