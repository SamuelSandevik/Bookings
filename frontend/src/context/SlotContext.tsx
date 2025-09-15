"use client"

import { Dispatch, createContext, useReducer } from "react";
import { SlotReducer, IAction } from "@/reducers/SlotReducer";
import { ISlot } from "@/models/ISlot";
import { IBookable } from "@/models/IBookable";

interface ISlotContext {
  slot: ISlot;
  dispatch: Dispatch<IAction>;
}

const initialState: ISlot = {
  uuid: "",
  date: 0,
  timeFrom: 0,
  timeTo: 0,
  maxCapacity: 1,
  bookable: {} as IBookable,
};

export const SlotContext = createContext<ISlotContext>({
  slot: initialState,
  dispatch: () => {},
});

export const SlotProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [slot, dispatch] = useReducer(SlotReducer, initialState);

  return (
    <SlotContext.Provider value={{ slot, dispatch }}>
      {children}
    </SlotContext.Provider>
  );
};


