import IUser from "@/models/IUser";
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.");
}

export default class Users {

    
    
    async signUp(user: IUser) {
        try {
            const { data } = await axios.post(
                BACKEND_URL + "auth/credentials/sign-up",
                {
                    email: user.email,
                    password: user.password,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    phone: user.phone,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return data;
        } catch (error) {
            console.error(error);
        }    
    }

    async signIn(email: string, password: string) {
        try {
            const {data} = await axios.post(BACKEND_URL + "auth/credentials/sign-in", {
                    email,
                    password
                }, {
                    headers: {
                      'Content-Type': 'application/json'
                    }
            }) 
            return data;
        } catch (error) {
            console.error(error);    
        }
    }

    async getUserData() {
        try {
            const {data} = await axios.get(BACKEND_URL + "users/me") 
            return data;
        } catch (error) {
            console.error(error);    
        }
    }

    async updateUserData(user: IUser) {
        try {
            const {data} = await axios.put(BACKEND_URL + "users/me", {    
                    user
                }, {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                }) 
            return data;
        } catch (error) {
            console.error(error);    
        }
    }
}