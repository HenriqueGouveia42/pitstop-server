import type { User } from "../../../entities/user.js";
import type { IUserRepository } from "../../user.repository.interface.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {

    saveUser(user: User): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findSavedUserById(user_id: string): Promise<User> {
        throw new Error("Method not implemented.");
    }
    updateSavedUser(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }
    listSavedUsers(): Promise<User[]> {
        throw new Error("Method not implemented.");
    }
    deleteSavedUserById(user_id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}