import BookableCard from "@/components/bookable-card";
import { CreateBookableForm } from "@/components/create-bookable-form";

export default function BookablesPage() {
  return (
    <div className="flex justify-evenly sm:flex-row flex-col items-stretch">
      <div className="bg-white p-6">
        <h1 className="text-2xl font-bold mb-4">List of created bookables</h1>
        <BookableCard></BookableCard>
      </div>

      <div className="w-[1px] rounded-lg bg-gray-300" />

      <div className="bg-white flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Create a Bookable</h1>
        <CreateBookableForm />
      </div>
    </div>
  );
}
