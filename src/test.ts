/*CRIAR BILL
*/
import { Bill } from "./modules/bill/entities/bill.js";
import { PrismaBillRepository } from "./modules/bill/repositories/implementations/prisma/bill.repository.prisma.js";

import { Product } from "./modules/product/entities/product.js";
import { PrismaProductRepository } from "./modules/product/repositories/implementations/prisma/product.repository.prisma.js";

import { User } from "./modules/user/entities/user.js";
import { PrismaUserRepository } from "./modules/user/repositories/implementations/prisma/user.repository.prisma.js";

const billRep: PrismaBillRepository = new PrismaBillRepository();
const prodRep: PrismaProductRepository = new PrismaProductRepository();
const userRep: PrismaUserRepository = new PrismaUserRepository();

const bill: Bill = await billRep.findSavedBillByGtinCode("8640");
const product: Product = await prodRep.findSavedProductByGtinCode("2218056364375");
const user: User = await userRep.findSavedUserById("c1baa089-d4d9-44a4-9dd7-ac230f0d0a2e");

