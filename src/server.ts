import 'dotenv/config';

import { Decimal } from "decimal.js"
import { Product} from "./modules/product/entities/product.js"
import { PrismaProductRepository } from "./modules/product/repositories/implementations/prisma/product.repository.prisma.js"
import { PrismaUserRepository } from "./modules/user/repositories/implementations/prisma/user.repository.prisma.js"
import { User, UserRole } from "./modules/user/entities/user.js"

const product: Product = Product.buildProduct(
    "COCA-COLA 350ML",
    new Decimal(5.50),
    "7894900010015",
    false
)

const user: User = User.buildUser(
    "Jesus",
    "false_hashing1742@@",
    UserRole.VENDEDOR
)

const userRepository = new PrismaUserRepository();

await userRepository.saveUser(user);