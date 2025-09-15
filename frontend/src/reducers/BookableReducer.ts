import { IBookable } from "@/models/IBookable";

export interface IAction {
  type: ActionType;
  payload: string;
}

export enum ActionType {
  SET_TITLE,
  SET_PRICE,
  SET_DESCRIPTION,
  SET_COLOR,
  SET_UUID,
}

export const BookableReducer = (
  bookable: IBookable,
  action: IAction
): IBookable => {
  switch (action.type) {
    case ActionType.SET_TITLE:
      return { ...bookable, title: action.payload };
    case ActionType.SET_PRICE:
      return { ...bookable, price: Number(action.payload) };
    case ActionType.SET_DESCRIPTION:
      return { ...bookable, desc: action.payload };
    case ActionType.SET_COLOR:
      return { ...bookable, color: action.payload };
    case ActionType.SET_UUID:
      return { ...bookable, uuid: action.payload };
    default:
      return bookable;
  }
};
