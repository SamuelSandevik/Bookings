import { DBMetaData } from "./DBMetaData";
import { IBookable } from "./IBookable";

export interface ISlot extends DBMetaData {
    date: number;
    timeFrom: number;
    timeTo: number; 
    maxCapacity: number;
    bookable: IBookable;
}