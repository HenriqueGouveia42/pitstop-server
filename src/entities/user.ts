export type UserProps = {
    user_id: string,
    username: string,
    password_hash: string,
    created_at: string,
    updated_at: string,
    role: string
}

export class User{

    private constructor (readonly props: UserProps){} 

    public static build(username: string, password_hash: string, role: string){
        
        const now: string = new Date().toISOString();
        
        return new User({
            user_id: crypto.randomUUID().toString(),
            username,
            password_hash,
            created_at: now,
            updated_at: now,
            role
        })
    }

    
    //getters
    public getUserId(){
        return this.props.user_id
    }

    public getUsername(){
        return this.props.username;
    }

    public getPasswordHash(){
        return this.props.password_hash;
    }

    public getCreatedAt(){
        return this.props.created_at;
    }

    public getUpdatedAt(){
        return this.props.updated_at;
    }

    public getRole(){
        return this.props.role;
    }

    //setters
    public setUpdatedNow(){
        this.props.updated_at = new Date().toISOString();
    }

    public setUsername(name: string){

        if (name.length > 50){
            throw new Error("Nome não pode ultrapassar 50 caracteres")
        }
        this.props.username = name;
        this.setUpdatedNow();
    }

}