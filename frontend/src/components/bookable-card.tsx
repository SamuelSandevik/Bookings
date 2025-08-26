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
        <div>
        <Button
          size="sm"
          variant="ghost"
          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
          onClick={() => {
              // edit bookable
            }}
            >
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => {
              // remove bookable
            }}
            >
          Remove
        </Button>
            </div>
      </CardFooter>
    </Card>
  );
};

export default BookableCard;

