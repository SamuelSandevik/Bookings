import { DBMetaData } from "./DBMetaData";

export default interface IUser extends DBMetaData {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
}