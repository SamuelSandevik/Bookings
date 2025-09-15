import { IBookable } from '@/models/IBookable';
import { ISlot } from '@/models/ISlot';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.");
}

export default class Slots {
    async getSlots(uuid: IBookable["uuid"], token: string): Promise<ISlot[] | null> {
       
        const config = {
          headers: {
            Authorization: token,
          },
        };

        try {
            const {data} = await axios.get(BACKEND_URL + "bookable-slots/" + uuid, config) 
            return data.data;
        } catch (error) {
            console.error(error); 
            return null;   
        }
    }
    
    async getSingleSlot(uuid: IBookable["uuid"], token: string): Promise<ISlot | null> {
        const config = {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json'
            }
        };

        try {
            const {data} = await axios.get(BACKEND_URL + "bookable-slots/" + uuid, config);
            return data.data;
        } catch (error) {
            console.error(error); 
            return null;   
        }
    }
    
    async createSlot(slot: Omit<ISlot, "uuid">, token: string) {
        try {
            const {data} = await axios.post(BACKEND_URL + "bookable-slots", {
                    bookable_uuid: slot.bookable.uuid,
                    date: slot.date,
                    max_capacity: slot.maxCapacity,
                    min_capacity: slot.minCapacity,
                    time_from: slot.timeFrom,
                    time_to: slot.timeTo,
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
    
    async updateSlot(uuid: string, slot: ISlot, token: string) {
        try {
            const {data} = await axios.put(BACKEND_URL + "bookable-slots/" + uuid, {
                    title: slot.title,
  
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

    async deleteSlot(uuid: ISlot["uuid"], token: string) {
        
        const config = {
          headers: {
            Authorization: token,
          },
        };

        try {
            const {data} = await axios.delete(BACKEND_URL + "bookable-slots/" + uuid, config)
            return data;
        } catch (error) {
            console.error(error);    
        }
    }        
}