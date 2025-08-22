"use client"

import { Dispatch, createContext, useReducer } from "react";
import { BookableReducer, IAction } from "@/reducers/BookableReducer";
import { IBookable } from "@/models/IBookable";

interface IBookableContext {
  bookable: IBookable;
  dispatch: Dispatch<IAction>;
}

const initialState = {
  title: "",
  price: 1,
  description: "",
  color: "",
};

export const BookableContext = createContext<IBookableContext>({
  bookable: initialState,
  dispatch: () => {},
});

export const BookableProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [bookable, dispatch] = useReducer(BookableReducer, initialState);

  return (
    <BookableContext.Provider value={{ bookable, dispatch }}>
      {children}
    </BookableContext.Provider>
  );
};


