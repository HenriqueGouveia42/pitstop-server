import { Bill, billStates, type BillProps} from "../../../entities/bill.js"
import type { IBillRepository } from "../../bill.repository.interface.js";
import { prisma } from "../../../../../shared/infra/prisma.js"
import { Decimal } from 'decimal.js';

export enum BillStatus{
    ABERTA = "ABERTA",
    FECHADA = "FECHADA",
    CANCELADA = "CANCELADA",
}

export class PrismaBillRepository implements IBillRepository {

    private static entityToPrismaDataMapper(bill: Bill): any{
        return{
            bill_id: bill.bill_id,
            bill_code_gtin: bill.bill_code,
            status: bill.status,
            created_at: bill.createdAt,
            updated_at: bill.updatedAt,
            items: bill.items
        }
    }

    private static prismaToEntityDataMapper(prismaData: any): Bill{

        const bill: BillProps = {
            bill_id: prismaData.bill_id,
            bill_code_gtin: prismaData.bill_code_gtin,
            status: prismaData.status,
            created_at: prismaData.created_at,
            updated_at: prismaData.updated_at,
            items: prismaData.items
                ? prismaData.items.map((item: any) =>({
                    bill_item_id: item.bill_item_id,
                    user_id: item.user_id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price_at_addition: new Decimal(item.price_at_addition)
                }))
                :   []      
        }
        return Bill.restoreBill(bill);

    }

    async saveBill(bill: Bill): Promise<void> {

        const rawPrismaData = PrismaBillRepository.entityToPrismaDataMapper(bill);

        console.log(rawPrismaData)

        const { items, ...prismaData} = rawPrismaData;

        await prisma.$transaction(async (tx) =>{

            const alreadyOpennedBill = await tx.bill.findFirst({
                where:{
                    bill_code_gtin: bill.bill_code,
                    status: BillStatus.ABERTA
                }
            })

            if(alreadyOpennedBill){
                throw new Error("Proibido Cria Nova comanda pois esta comanda física ainda está aberta")
            }

            await tx.bill.create({
                data: prismaData
            })

        })

       
    }

    findSavedBillById(bill_id: string): Promise<Bill> {
        throw new Error("Method not implemented.");
    }

    async findSavedBillByGtinCode(gtin_code: string): Promise<Bill> {

        const prismaBill = await prisma.bill.findFirst({
            where:{
                bill_code_gtin: gtin_code,
                status: billStates.ABERTA
            },
            include: {
                items: true 
            }
        })

        if(!prismaBill){
            throw new Error(`Comanda com o gtin_code ${gtin_code} não encontrada`)
        }

        const entityBill: Bill = PrismaBillRepository.prismaToEntityDataMapper(prismaBill);

        return entityBill

    }

    async updateSavedBill(bill: Bill): Promise<Bill> {

        const mappedBill = PrismaBillRepository.entityToPrismaDataMapper(bill)

        //const {bill_id, created_at, ...dataToUpdate} = mappedBill;
        const { bill_id, created_at, items, ...dataToUpdate } = mappedBill;

        let updatedPrismaBill;
        
        await prisma.$transaction(async (tx) =>{

            await tx.bill.update({
                where:{
                    bill_id: bill.bill_id
                },
                data: dataToUpdate
            })

            // Sincroniza itens: Deleta existentes e cria novos
            await tx.billProduct.deleteMany({
                where: { bill_id: bill.bill_id },
            });

            if (bill.items.length > 0) {
                await tx.billProduct.createMany({
                    data: bill.items.map(item => ({
                        bill_item_id: item.bill_item_id,
                        quantity: item.quantity,
                        price_at_addition: item.price_at_addition.toNumber(),
                        bill_id: bill.bill_id,
                        product_id: item.product_id,
                        user_id: item.user_id,
                    })),
                });
            }

            //recupera o atualizado com itens
            updatedPrismaBill = await tx.bill.findUnique({
                where: { bill_id: bill.bill_id },
                include: { items: true },
            });
        
        })

        if (!updatedPrismaBill) {
            throw new Error("Erro ao atualizar comanda");
        }

        return PrismaBillRepository.prismaToEntityDataMapper(updatedPrismaBill);
    }

    listSavedBills(): Promise<Bill[]> {
        throw new Error("Method not implemented.");
    }
    deleteSavedBillById(bill_id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}