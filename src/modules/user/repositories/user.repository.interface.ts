import { User } from "../entities/user.js";

export interface IUserRepository {
    saveUser(user: User): Promise<void>;
    findSavedUserById(user_id: string): Promise<User>;
    updateSavedUser(user: User): Promise<User>;
    listSavedUsers(): Promise<User[]>;
    deleteSavedUserById(user_id: string): Promise<void>;
}