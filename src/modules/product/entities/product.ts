import { Decimal } from 'decimal.js';

export type ProductProps = {
    readonly product_id: string;
    readonly name: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly unit_price_in_reais: Decimal;
    readonly gtin_code: string;
    readonly is_internal: boolean;
    readonly active: boolean;
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

        const startsWith22 = gtin.startsWith('22');

        if( startsWith22 && !is_internal){
            throw new Error("Erro! Produto comeca com '22', prefixo reservado apenas a produtos internos")
        }

        if(!startsWith22 && is_internal){
            throw new Error("Erro! Produto é interno e nao comeca com o prefixo '22', reservado apenas a produtos internos")
        }


    }

    private static validateName(name: string) {
        if (name.length > 100) throw new Error("Nome muito longo");
    }

    private static validatePrice(price: Decimal) {
        if (price.isNegative() || price.gt(1000000)) throw new Error("Preço fora da faixa permitida");
    }

    private static generateExpectedVerifierDigitGtin13(current12DigitsString: string): string{

        if(current12DigitsString.length != 12){
            throw new Error("O valor experado do Digito verificador so pode ser calculado com os primeiros 12 digitos")
        }

        let sum: number = 0;
        let impar: boolean = true;

        for (let i = 0; i < current12DigitsString.length; i++){
            impar ?
                sum += Number(current12DigitsString[i])
            :
                sum += Number(current12DigitsString[i]) * 3;
            
            impar = !impar
        }

        return ((10 - (sum % 10)) % 10).toString();
    }

    private static generateGtin13CodeForInternalProduct(): string 
    {
        let result: string = '22';

        for (let i = 0; i < 10; i++){
            result += Math.floor(Math.random() * 10).toString()
        }

        const verifierDigit: string = Product.generateExpectedVerifierDigitGtin13(result)

        return result + verifierDigit
    }

    //produtos internos vao ter gtin13 code sempre comecando com 202
    public static buildProduct(
        name: string, 
        unit_price_in_reais: Decimal, 
        gtin_code?: string | null | undefined, 
        is_internal: boolean = true,
        active: boolean = true
    ): Product {

        let finalGtin: string;

        //REGRA 1: Produto externo OBRIGATORIAMENTE precisa de GTIN
        if (!is_internal && !gtin_code) {
            throw new Error("Um produto externo deve possuir um GTIN-13 informado.");
        }

        //REGRA 2: Se for interno e NÃO tiver GTIN, gera um.
        if (is_internal && !gtin_code) {
            finalGtin = Product.generateGtin13CodeForInternalProduct();
        } 

        //REGRA 3: Se o GTIN foi passado (seja interno manual ou externo), usa ele.
        else {
            //o compilador TS sabe que gtin_code existe aqui por causa da Regra 1
            finalGtin = gtin_code!; 
        }
       
       
        Product.validateGtin13Code(finalGtin, is_internal);
        Product.validateName(name);
        Product.validatePrice(unit_price_in_reais);

        const now = new Date().toISOString();

        return new Product({
            product_id: crypto.randomUUID(),
            name,
            created_at: now,
            updated_at: now,
            unit_price_in_reais,
            gtin_code: finalGtin,
            is_internal,
            active
        });
    }

    public static restoreProduct(props: ProductProps): Product {

        Product.validateGtin13Code(props.gtin_code, props.is_internal);
        Product.validateName(props.name);
        Product.validatePrice(props.unit_price_in_reais);
        return new Product(props);
    }

    //getters para acesso seguro aos dados -- readonly permite apenas ler
    get id() { return this.props.product_id; }
    get name() { return this.props.name; }
    get price() { return this.props.unit_price_in_reais; }
    get gtin() { return this.props.gtin_code; }
    get isInternal() { return this.props.is_internal; }
    get createdAt() {return this.props.created_at; }
    get updatedAt() { return this.props.updated_at; }
    get active() { return this.props.active; }

    //setter que retorna novo objeto, mantendo a imutabilidade de um objeto criado
    public withUpdatedData(newName:string, newPrice: Decimal): Product{

        Product.validateName(newName);
        Product.validatePrice(newPrice);

        return new Product({
            ...this.props,
            name: newName,
            unit_price_in_reais: newPrice,
            updated_at: new Date().toISOString()
        })
    }
}