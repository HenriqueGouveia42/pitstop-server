import { Decimal } from 'decimal.js';
import { Product } from '../../product/entities/product.js';
import { User } from '../../user/entities/user.js';

//tipo de um item na comanda
export type BillItemProps = {
    readonly bill_item_id:  string; //representa uma adição específica em uma comanda específica
    readonly user_id: string; //quem adicionou
    readonly product_id: string; //qual produto
    readonly quantity: number; //quantidade
    readonly price_at_addition: Decimal;
}


//estados possiveis de uma comanda
export enum billStates{
    ABERTA = "ABERTA", //apta a receber novos itens - estado inicial da criacao de uma comanda
    FECHADA = "FECHADA",
    CANCELADA = "CANCELADA"
}

//tipo de uma comanda em uso
export type BillProps = {
    readonly bill_id: string; //representa um uso específico da comanda física
    readonly bill_code_gtin: string; //representa uma comanda física. Comanda "1025", por exemplo, que será utilizada por diversos clientes
    readonly status: billStates;
    readonly created_at: string;
    readonly updated_at: string;
    readonly items: BillItemProps[]; //relacionamento com bill_items
}

export class Bill {

    private constructor(private readonly props: BillProps) {}

    private static validateBillCode(gtin: string){

        if(gtin.length != 4){
            throw new Error("Codigo da comanda precisa ter 4 digitos")
        }

        //verificas se a string contém APENAS dígitos de 0 a 9
        if (!/^\d+$/.test(gtin)) {
            throw new Error("O código de 4 digitos deve conter apenas números");
        }

        const startsWith0 = gtin.startsWith('0');

        if(startsWith0){
            throw new Error("O código da comanda nao pode comecar com '0'");
        }

        const lastNumber = Number(gtin.slice(-1));

        let sum: number = 0;
        let impar: boolean = true;

        for(let i = 0; i < gtin.length-1; i++){

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
            throw new Error("Codigo da comanda inválido. Digito Verificador incorreto. O codigo de 4 digitos segue a mesma regra do GTIN-13 para o Digito Verificador.")
        }
    }

    public static buildBill(bill_code_gtin: string): Bill {

        Bill.validateBillCode(bill_code_gtin);

        const now = new Date().toISOString();

        return new Bill({
            bill_id: crypto.randomUUID().toString(),
            bill_code_gtin: bill_code_gtin,
            status: billStates.ABERTA, //ao buildar um objeto de comanda, essa comanda física passa a poder receber itens - status ABERTA
            created_at: now,
            updated_at: now,
            items: [] //inicia sem itens
        });
    }

    public static restoreBill(props: BillProps): Bill{
        return new Bill(props)
    }

    //getters para acesso seguro aos dados -- readonly permite apenas ler
    get bill_id() {return this.props.bill_id}
    get bill_code() {return this.props.bill_code_gtin}
    get status() {return this.props.status}
    get createdAt() {return this.props.created_at}
    get updatedAt() {return this.props.updated_at}
    get items() {return this.props.items}

    public withClosedBill(): Bill{ //fechar comanda - realizar venda

        if(this.props.status === billStates.FECHADA){
            throw new Error("Essa comanda já está fechada");
        }

        if(this.props.items.length === 0){
            throw new Error("Não pode fechar uma comanda sem itens")
        }

        return new Bill({
            ...this.props,
            status: billStates.FECHADA,
            updated_at: new Date().toISOString()
        })
    }

    public withReopenedBill(): Bill{ //reabrir comanda - venda realizada - adicionar mais itens

        if(this.props.status !== billStates.FECHADA){
            throw new Error("Apenas comandas fechadas podem ser reabertas");
        }
        return new Bill({
            ...this.props,
            status: billStates.ABERTA,
            updated_at: new Date().toISOString()
        })
    }

    public withNewProductAddedToBill(product: Product, quantity: number, user_id: string): Bill {

        //validacoes de quantidade e estatus da comanda
        if (quantity <= 0) throw new Error("A quantidade deve ser maior que zero.");
        if (this.props.status !== billStates.ABERTA) throw new Error("Não é possível adicionar itens a uma comanda que não está ABERTA.");
        if (!product.active) {
            throw new Error("Este produto está arquivado/inativo e não pode ser vendido.");
        }
        
        //verifica se o item com mesmo preco ja existe na comanda
        const existingItemIndex = this.props.items.findIndex(item => 
            (item.product_id === product.id)
            &&
            (item.price_at_addition.equals(product.price))
            &&
            (item.user_id === user_id) //so agrupa se id, preco e usuario que lancou forem iguais
        );
        
        const itemsToAdd = [...this.props.items];

        if (existingItemIndex !== -1){ //item ja existe na comanda e preco nao mudou
    
           const currentItem = itemsToAdd[existingItemIndex];

            if (!currentItem) {
                throw new Error("Erro interno... na entidade bills - adicionando item à comanda.");
            }
            
            itemsToAdd[existingItemIndex] = {
                ...currentItem,
                quantity: currentItem.quantity + quantity
            };

        } else { //item ainda nao existe na comanda ou ja existe mas com preco diferente

            const newItem: BillItemProps = {
                bill_item_id: crypto.randomUUID().toString(),
                user_id: user_id,
                product_id: product.id,
                quantity: quantity,
                price_at_addition: product.price
            }

            itemsToAdd.push(newItem);
        }

       return new Bill({...this.props, items: itemsToAdd, updated_at: new Date().toISOString()});
    }

    public withProductRemovedFromBill(product_id: string, quantityToRemove: number): Bill {
        
        //validacoes basicas
        if (this.props.status !== billStates.ABERTA) {
            throw new Error("Não é possível remover itens de uma comanda fechada ou cancelada.");
        }
        if (quantityToRemove <= 0) {
            throw new Error("A quantidade a remover deve ser maior que zero.");
        }

        // 2. Encontrar o item (Aqui simplifiquei para achar pelo produto, 
        // mas idealmente num PDV você remove pelo ID da linha 'bill_item_id' para ser exato)
        // Como sua lógica agrupa por Preço+User+Produto, vamos buscar itens compatíveis.
        
        // Cópia da lista para imutabilidade
        let itemsCurrent = [...this.props.items];
        let quantityRemainingToRemove = quantityToRemove;

        // Estratégia: Remover dos itens mais recentes ou varrer a lista.
        // Vamos varrer procurando o produto.
        const indexesToUpdate: number[] = [];

        // Filtra itens que são desse produto
        const targetItems = itemsCurrent.filter(i => i.product_id === product_id);

        if (targetItems.length === 0) {
            throw new Error("Este produto não existe nesta comanda.");
        }

        // Soma total disponível desse produto na comanda
        const totalQuantityAvailable = targetItems.reduce((acc, item) => acc + item.quantity, 0);

        if (totalQuantityAvailable < quantityToRemove) {
            throw new Error(`Tentativa de remover ${quantityToRemove} itens, mas só existem ${totalQuantityAvailable} na comanda.`);
        }

        // 3. Lógica de Remoção (FIFO ou LIFO - aqui removendo qualquer um que achar)
        // Isso é complexo porque temos múltiplos 'users' adicionando. 
        // REGRA DE NEGÓCIO: Geralmente removemos do último que adicionou ou exigimos o ID da linha.
        // VOU SIMPLIFICAR: Vamos remover pelo bill_item_id se o front mandar, ou remover do primeiro que achar.
        
        // *Sugestão*: Mude a assinatura para receber o bill_item_id. É mais seguro.
        // Mas para manter seu padrão atual de agrupar, vamos iterar e subtrair.

        const newItems: BillItemProps[] = [];

        for (const item of itemsCurrent) {
            // Se não é o produto, mantém
            if (item.product_id !== product_id) {
                newItems.push(item);
                continue;
            }

            // Se já removemos tudo que precisava, mantém o resto
            if (quantityRemainingToRemove <= 0) {
                newItems.push(item);
                continue;
            }

            if (item.quantity > quantityRemainingToRemove) {
                // O item tem mais do que precisamos remover. Apenas diminui.
                newItems.push({
                    ...item,
                    quantity: item.quantity - quantityRemainingToRemove
                });
                quantityRemainingToRemove = 0;
            } else {
                // O item tem igual ou menos. Removemos o item inteiro (não damos push no newItems)
                // e abatemos do que falta remover.
                quantityRemainingToRemove -= item.quantity;
            }
        }

        return new Bill({
            ...this.props,
            items: newItems,
            updated_at: new Date().toISOString()
        });
    }

    public withCancelledBill(): Bill {

        if (this.props.status !== billStates.ABERTA) {
            throw new Error("Apenas comandas abertas podem ser canceladas.");
        }
        return new Bill({
            ...this.props,
            status: billStates.CANCELADA,
            updated_at: new Date().toISOString()
        });
    }

    public calculateTotalBillAmount(): Decimal {   
        return this.props.items.reduce((acc, item) => {
            return acc.plus(item.price_at_addition.times(item.quantity));
        }, new Decimal(0));
    }
}