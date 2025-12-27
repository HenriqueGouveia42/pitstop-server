import 'dotenv/config';
import type { UserProps, UserRole } from "../../../entities/user.js";
import { User } from "../../../entities/user.js";
import type { IUserRepository } from "../../user.repository.interface.js";

import { prisma } from "../../../../../shared/infra/prisma.js"

export class PrismaUserRepository implements IUserRepository {

    async saveUser(user: User): Promise<void> {
        
        const entityDataToRawPrismaData = {
            user_id: user.id,
            username: user.username,
            password_hash: user.passwordHash,
            role: user.role,
            created_at: new Date(user.createdAt),
            updated_at: new Date(user.updatedAt)
        }

        await prisma.user.create({
            data: entityDataToRawPrismaData
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

        const userProps: UserProps = {
            user_id: prismaUser.user_id,
            username: prismaUser.username,
            password_hash: prismaUser.password_hash,
            created_at: prismaUser.created_at.toISOString(),
            updated_at: prismaUser.updated_at.toISOString(),
            role: prismaUser.role as UserRole,
            active: prismaUser.active
        }

        const user: User = User.restore(userProps);

        return user;
    }

    async updateSavedUser(user: User): Promise<void> {

        const rawPrismaData = {
            username: user.username,
            password_hash: user.passwordHash,
            updated_at: new Date(user.updatedAt)
        }

        await prisma.user.update({
            where:{
                user_id: user.id
            },
            data: rawPrismaData
        });
    }

    async listAllSavedUsers(): Promise<User[]> {

        const prismaUsers = await prisma.user.findMany();

        let users: User[] = [];

        for (const prismaUser of prismaUsers){

            const user: User = User.restore({
                user_id: prismaUser.user_id,
                username: prismaUser.username,
                password_hash: prismaUser.password_hash,
                created_at: prismaUser.created_at.toISOString(),
                updated_at: prismaUser.updated_at.toISOString(),
                role: prismaUser.role as UserRole,
                active: prismaUser.active
            })

            users.push(user)
            
        }

        return users;


    }

    async deactivateSavedUserById(user_id: string): Promise<void> {
        await prisma.user.update({
            where:{
                user_id: user_id
            },
            data:{
                active: false
            }
        })
    }

    async activateSavedUserById(user_id: string): Promise<void> {
        await prisma.user.update({
            where:{
                user_id: user_id
            },
            data:{
                active: true
            }
        })
    }
}