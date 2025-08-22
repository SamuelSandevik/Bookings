import { DBMetaData } from "./DBMetaData";

export interface IBookable extends DBMetaData{
    title: string;
    price: number;
    description: string;
    color: string;
}