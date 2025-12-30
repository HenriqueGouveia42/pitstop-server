export enum UserRole {
    GESTOR = "GESTOR",
    CAIXA = "CAIXA",
    VENDEDOR = "VENDEDOR"
}

export type UserProps = {
    readonly user_id: string;
    readonly username: string;
    readonly password_hash: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly role: UserRole;
    readonly active: boolean;
}

export class User {
    //construtor privado para garantir o uso do builder/fábrica
    private constructor(private readonly props: UserProps) {}

    //validacoes
    private static validateUsername(username: string): void {
        if (username.length < 3) throw new Error("Nome de usuário deve ter pelo menos 3 caracteres");
        if (username.length > 50) throw new Error("Nome de usuário não pode ultrapassar 50 caracteres");
    }

    //fabric apara criação de novos usuários (cadastrar novo usuario)
    public static buildUser(username: string, password_hash: string, role: UserRole): User {
        User.validateUsername(username);

        const now = new Date().toISOString();

        return new User({
            user_id: crypto.randomUUID(),
            username,
            password_hash,
            created_at: now,
            updated_at: now,
            role,
            active: true
        });
    }

    public static restore(props: UserProps): User{
        User.validateUsername(props.username);
        return new User(props);
    }

    //getters
    get id() { return this.props.user_id; }
    get username() { return this.props.username; }
    get passwordHash() { return this.props.password_hash; }
    get role() { return this.props.role; }
    get createdAt() { return this.props.created_at; }
    get updatedAt() { return this.props.updated_at; }
    get active() { return this.props.active; }

    //setters que retornam novos objetos, mantendo a imutabilidade de um objeto criado
    public withUpdatedData(newUsername:string, newHashedPassword: string): User {

        User.validateUsername(newUsername);

        return new User({
            ...this.props,
            username: newUsername,
            password_hash: newHashedPassword,
            updated_at: new Date().toISOString()
        })
    }
}