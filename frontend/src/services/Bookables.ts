import { IBookable } from '@/models/IBookable';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.");
}

export default class Users {
    async getBookables(): Promise<IBookable[] | null> {
        try {
            const {data} = await axios.get(BACKEND_URL + "bookables")
            return data;
        } catch (error) {
            console.error(error)
            return null
        }    
    }
    async createBookable(bookable: IBookable) {
        try {
            const {data} = await axios.post(BACKEND_URL + "bookables", {
                    bookable
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
    
    async updateBookable(bookable: IBookable) {
        try {
            const Uuid = bookable.Uuid
            const {data} = await axios.post(BACKEND_URL + "bookables/" + Uuid, {
                    bookable
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

    async deleteBookable(bookable: IBookable) {
        try {
            const Uuid = bookable.Uuid
            const {data} = await axios.delete(BACKEND_URL + "bookables/" + Uuid)
            return data;
        } catch (error) {
            console.error(error);    
        }
    }        
}