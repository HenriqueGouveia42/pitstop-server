import { User } from "../entities/user.js";

export interface IUserRepository {
    saveUser(user: User): Promise<void>;
    findSavedUserById(user_id: string): Promise<User>;
    updateSavedUser(user: User): Promise<void>;
    listAllSavedUsers(active: boolean): Promise<User[]>;
    deactivateSavedUserById(user_id: string): Promise<void>;
    activateSavedUserById(user_id: string): Promise<void>;
}