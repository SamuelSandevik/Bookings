"use client";

import { useContext } from "react";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { IBookable } from "@/models/IBookable";
import { BookableContext } from "@/context/BookableContext";
import { ActionType } from "@/reducers/BookableReducer";
import Bookables from "@/services/Bookables";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface BookableCardProps extends IBookable {
  onEdit?: () => void;
  onRemoved?: () => void; // <-- add this prop
}

const BookableCard = (props: BookableCardProps) => {
  const { dispatch } = useContext(BookableContext);
  const { token } = useAuth();
  const router = useRouter();

  const bookableService = new Bookables();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: ActionType.SET_TITLE, payload: props.title });
    dispatch({ type: ActionType.SET_PRICE, payload: String(props.price) });
    dispatch({ type: ActionType.SET_DESCRIPTION, payload: props.desc });
    dispatch({ type: ActionType.SET_COLOR, payload: props.color });
    dispatch({ type: ActionType.SET_UUID, payload: props.uuid || "" });
    if (props.onEdit) props.onEdit();
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await bookableService.deleteBookable(props, token!);
    if (props.onRemoved) props.onRemoved();
  };

  const handleString = (description: string) => {
    if (description.length > 30) {
      return description.slice(0, 40) + "...";
    }
    return description;
  };

  return (
    <Card
      onClick={() => {
        router.push(`/bookables/${props.uuid}`);
      }}
  className="m-0 flex cursor-pointer flex-col justify-between h-32 w-full min-w-0 items-center border gap-0 py-0 shadow-sm rounded-xl overflow-hidden bg-white hover:bg-gray-100 transition"
    >
      <div
        className="h-1 m-0  rounded-full w-3/4"
        style={{ backgroundColor: props.color }}
      />
      <CardHeader className="p-3 w-full">
        <CardTitle className="text-md font-semibold text-center">
          - {props.title} -
        </CardTitle>
        <div className="text-xs w-full text-gray-500 text-left">
          {handleString(props.desc)}
        </div>
      </CardHeader>

      <CardFooter className="p-2 flex items-center w-full justify-between text-xs">
        <span className="">{props.price}kr</span>
        <div>
          <Button
            size="sm"
            variant="ghost"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 cursor-none"
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-100 cursor-none"
            onClick={handleRemove}
          >
            Remove
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookableCard;

