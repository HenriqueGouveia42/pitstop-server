import { Product } from "./modules/product/entities/product.js"
import { PrismaProductRepository } from "./modules/product/repositories/implementations/prisma/product.repository.prisma.js"

import { User, UserRole } from "./modules/user/entities/user.js"
import { PrismaUserRepository } from "./modules/user/repositories/implementations/prisma/user.repository.prisma.js"

import { Bill } from "./modules/bill/entities/bill.js"
import { Decimal } from "decimal.js"



const userRep: PrismaUserRepository = new PrismaUserRepository()
const user: User = await userRep.findSavedUserById("c1baa089-d4d9-44a4-9dd7-ac230f0d0a2e")
//console.log(user)

const productRep: PrismaProductRepository = new PrismaProductRepository();
const p1: Product = await productRep.findSavedProductByGtinCode("2218056364375");
//console.log(p1)

const bill: Bill = Bill.buildBill(
    "7890"
)
console.log(bill)

const addedP1ToBill: Bill = bill.withNewProductAddedToBill(p1, 6, user.id)
//console.log(addedP1ToBill.items)

const p2: Product = await productRep.findSavedProductByGtinCode("7894900010015")
//console.log(p2)

const addedP2ToBill: Bill = addedP1ToBill.withNewProductAddedToBill(p2, 3, user.id);
//console.log(addedP2ToBill.items)

const p1Modified: Product = p1.withUpdatedData(p1.name, new Decimal('4.50'))

const addedToBill: Bill = addedP2ToBill.withNewProductAddedToBill(p1Modified, 1, user.id);

const totalAmount: Decimal = addedToBill.calculateTotalBillAmount();

//console.log(addedToBill)
//console.log(addedToBill.items)
//console.log(totalAmount)

const closed: Bill = addedToBill.withClosedBill()

console.log(closed)

const addedToClose: Bill = closed.withNewProductAddedToBill(p1, 2, user.id)

console.log("Success!");




