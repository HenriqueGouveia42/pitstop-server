import type { UserProps, UserRole } from "../../../entities/user.js";
import { User } from "../../../entities/user.js";
import type { IUserRepository } from "../../user.repository.interface.js";

import { prisma } from "../../../../../shared/infra/prisma.js"

export class PrismaUserRepository implements IUserRepository {

    private static prismaToEntityDataMapper(prismaUser: any): User {

        const userProps: UserProps = {
            user_id: prismaUser.user_id,
            username: prismaUser.username,
            password_hash: prismaUser.password_hash,
            role: prismaUser.role as UserRole,
            created_at: prismaUser.created_at.toISOString(),
            updated_at: prismaUser.updated_at.toISOString(),
            active: prismaUser.active
        }

        return User.restore(userProps);
    }

    private static entityToPrismaDataMapper(user: User): any {
        return{
            user_id: user.id,
            username: user.username,
            password_hash: user.passwordHash,
            role: user.role,
            created_at: new Date(user.createdAt),
            updated_at: new Date(user.updatedAt),
            active: user.active
        }
    }

    async saveUser(user: User): Promise<void> {
        
        const prismaData = PrismaUserRepository.entityToPrismaDataMapper(user);

        await prisma.user.create({
            data: prismaData
        })
    }

    async findSavedUserById(user_id: string): Promise<User> {

        const prismaUser = await prisma.user.findUnique({
            where:{
                user_id: user_id
            }
        })

        if(!prismaUser){
            throw new Error("Usuário não encontrado");
        }

        const user = PrismaUserRepository.prismaToEntityDataMapper(prismaUser);

        return user;
    }

    async updateSavedUser(user: User): Promise<void> {

        const prismaData = PrismaUserRepository.entityToPrismaDataMapper(user);

        const { user_id, created_at, ...dataToUpdate } = prismaData;

        await prisma.user.update({
            where:{
                user_id: user.id
            },
            data: dataToUpdate
        });
    }

    async listAllSavedUsers(active: boolean): Promise<User[]> {

        const prismaUsers = await prisma.user.findMany({
            where:{
                active: active
            }
        });

        if (prismaUsers.length === 0){
            return [];
        }

        return prismaUsers.map(prismaUser =>
            PrismaUserRepository.prismaToEntityDataMapper(prismaUser)
        );       
    }

}