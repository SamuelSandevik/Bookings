"use client";

import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface PlaceholderBookableCardProps {
  onCreate: () => void;
}

const PlaceholderBookableCard = ({ onCreate }: PlaceholderBookableCardProps) => {
  return (
    <Card
      onClick={onCreate}
  className="m-0 flex cursor-pointer flex-col justify-between h-40 w-full min-w-0 items-center border border-dashed gap-0 py-0 shadow-sm rounded-xl overflow-hidden bg-white hover:bg-gray-100 transition"
    >
      <CardHeader className=" w-full flex flex-col items-center justify-center">
        <CardTitle className="text-md font-semibold text-center text-gray-400">
          Add new bookable
        </CardTitle>
        <div className="text-xs w-full text-gray-400 text-center truncate">
          Click to create a new bookable
        </div>
      </CardHeader>
      <CardFooter className="flex items-center pb-2 w-full justify-center text-xs">
        <Button
          size="sm"
          variant="outline"
          className="text-gray-500 border-gray-300"
          onClick={e => {
            e.stopPropagation();
            onCreate();
          }}
        >
          Create
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlaceholderBookableCard;