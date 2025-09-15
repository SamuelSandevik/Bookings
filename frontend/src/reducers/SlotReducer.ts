import { ISlot } from "@/models/ISlot";
import { IBookable } from "@/models/IBookable";

export interface IAction {
  type: ActionType;
  payload: any;
}

export enum ActionType {
  SET_DATE,
  SET_TIME_FROM,
  SET_TIME_TO,
  SET_MAX_CAPACITY,
  SET_BOOKABLE,
  SET_UUID,
}

export const SlotReducer = (
  slot: ISlot,
  action: IAction
): ISlot => {
  switch (action.type) {
    case ActionType.SET_DATE:
      return { ...slot, date: action.payload };
    case ActionType.SET_TIME_FROM:
      return { ...slot, timeFrom: action.payload };
    case ActionType.SET_TIME_TO:
      return { ...slot, timeTo: action.payload };
    case ActionType.SET_MAX_CAPACITY:
      return { ...slot, maxCapacity: action.payload };
    case ActionType.SET_BOOKABLE:
      return { ...slot, bookable: action.payload as IBookable };
    case ActionType.SET_UUID:
      return { ...slot, uuid: action.payload };
    default:
      return slot;
  }
};
