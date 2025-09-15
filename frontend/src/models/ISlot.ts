import { DBMetaData } from "./DBMetaData";
import { IBookable } from "./IBookable";

export interface ISlot extends DBMetaData {
    uuid: string;
    date: number;
    timeFrom: number;
    timeTo: number; 
    maxCapacity: number;
    minCapacity: number;
    bookable: IBookable;
}