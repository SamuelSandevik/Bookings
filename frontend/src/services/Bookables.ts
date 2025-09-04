import { IBookable } from '@/models/IBookable';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.");
}

export default class Bookables {
    async getBookables(token: string): Promise<IBookable[] | null> {
       
        const config = {
          headers: {
            Authorization: token,
          },
        };

        try {
            const {data} = await axios.get(BACKEND_URL + "bookables", config) 
            return data.data;
        } catch (error) {
            console.error(error); 
            return null;   
        }
    }
    
    async getSingleBookable(uuid: string, token: string): Promise<IBookable | null> {
        const config = {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json'
            }
        };

        try {
            const {data} = await axios.get(BACKEND_URL + "bookables/" + uuid, config);
            return data.data;
        } catch (error) {
            console.error(error); 
            return null;   
        }
    }
    
    async createBookable(bookable: IBookable, token: string) {
        try {
            const {data} = await axios.post(BACKEND_URL + "bookables", {
                    title: bookable.title,
                    price: bookable.price,
                    desc: bookable.desc,
                    color: bookable.color,
                }, {
                    headers: {
                       Authorization: token,
                      'Content-Type': 'application/json'
                    }
                }) 
            return data;
        } catch (error) {
            console.error(error);    
        }
    }
    
    async updateBookable(uuid: string, bookable: IBookable, token: string) {
        try {
            const {data} = await axios.put(BACKEND_URL + "bookables/" + uuid, {
                    title: bookable.title,
                    price: bookable.price,
                    desc: bookable.desc,
                    color: bookable.color,
                }, {
                    headers: {
                       Authorization: token,
                      'Content-Type': 'application/json'
                    }
                }) 
            return data;
        } catch (error) {
            console.error(error);    
        }
    }      

    async deleteBookable(bookable: IBookable, token: string) {
        
        const config = {
          headers: {
            Authorization: token,
          },
        };

        try {
            const uuid = bookable.uuid
            const {data} = await axios.delete(BACKEND_URL + "bookables/" + uuid, config)
            return data;
        } catch (error) {
            console.error(error);    
        }
    }        
}