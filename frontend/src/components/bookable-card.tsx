"use client";

import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { IBookable } from "@/models/IBookable";

const BookableCard = (bookable: IBookable) => {


  return (
    <Card className="flex flex-col justify-between items-center border gap-0 py-0 shadow-sm rounded-xl overflow-hidden">
        <div
          className="h-1 m-0  rounded-full w-3/4"
          style={{ backgroundColor: bookable.color }}
        />
      <CardHeader className="p-3 w-full">
        <CardTitle className="text-md font-semibold text-center">
          - {bookable.title} -
        </CardTitle>
        <div className="text-xs w-full text-gray-500 text-left">
          {bookable.description}
        </div>
      </CardHeader>

      <CardFooter className="p-2 flex items-center w-full justify-between text-xs">
        <span className="">{bookable.price}kr</span>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => {
            // Clear the bookable (reset to initial state)
            dispatch({ type: 0, payload: "" }); // SET_TITLE to ""
            dispatch({ type: 1, payload: "1" }); // SET_PRICE to 1
            dispatch({ type: 2, payload: "" }); // SET_DESCRIPTION to ""
            dispatch({ type: 3, payload: "" }); // SET_COLOR to ""
          }}
        >
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookableCard;

