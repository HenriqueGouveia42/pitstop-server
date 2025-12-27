import 'dotenv/config';

import { PrismaUserRepository } from "./modules/user/repositories/implementations/prisma/user.repository.prisma.js"
import { User, UserRole } from "./modules/user/entities/user.js"



const user: User = User.buildUser(
    "ANDERasdasdasIA",
    "passasdasdaro@@!#123",
    UserRole.GESTOR
)

console.log(user)

const userRepository = new PrismaUserRepository();

await userRepository.saveUser(user);

console.log("Sucess!")