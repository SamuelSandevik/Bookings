import { DBMetaData } from "./DBMetaData";

export interface IBookable extends DBMetaData{
    title: string;
    price: number;
    desc: string;
    color: string;
    image: string;
}