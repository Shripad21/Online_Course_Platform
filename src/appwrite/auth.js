import env from "../env/env"
import {Client, Account, ID} from 'appwrite'

class AuthService {
    client = new Client()
    account
    constructor(){
        this.client
            .setEndpoint(env.appwriteUrl)
            .setProject(env.projectId)
        this.account = new Account(this.client)
    }
    async createAccount({email, password, name}){
        try {
            const userAccount = await this.account.create(
                ID.unique(),
                email,
                password,
                name
            )
            if(userAccount){
                return this.login({email,password})
            } else {
                return userAccount
            }
        } catch (error) {
            console.log(error)
            throw error
        }
    }
    async login({email, password}){
        try {
            return await this.account.createEmailPasswordSession(
                email,
                password
            )
        } catch (error) {
            console.log('appwrite service login :: error :: ', error)
            throw error
        }
    }
    async getCurrentUser() {
        try {
            const response = await this.account.get();
            // console.log("User Data: ", response);  // This should log the user data
            return response;
        } catch (error) {
            console.error("Error fetching current user:", error);  // Log the error for debugging
            throw error;  // Keep throwing the error for the caller
        }
        return null;
    }
    

    async logout(){
        try {
            return await this.account.deleteSessions()
        } catch (error) {
            console.log('appwrite service logout :: error :: ', error)
            throw error
        }
    }
}

const authService = new AuthService()

export default authService