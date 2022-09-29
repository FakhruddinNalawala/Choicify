import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { useLoaderData } from "react-router-dom";
import { Spinner } from "../../../components/Spinner";
import { request } from "../../../utils/sessionUtils";

interface DecisionList {
  id: number;
  question: string;
}

export const EditDecisionList: FC = () => {
  const decisionList = useLoaderData() as DecisionList;
  const { data, isLoading } = useQuery<DecisionOption[], Error>(
    [`options-${decisionList.id}`],
    async () => {
      let res = await request(`/api/decisionList/${decisionList.id}/options`);
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.json();
    }
  );

  return (
    <div>
      <div className="absolute top-0 flex w-full justify-center pt-3 pr-3 pl-3">
        <div className="w-full max-w-4xl">
          <button className="h-10 w-9/12 border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none">
            Singleplayer
          </button>
        </div>
      </div>
      <div className="mt-20 flex w-full justify-center">
        <h1 className="m-4 w-full max-w-4xl text-center text-2xl">
          {decisionList.question}
        </h1>
      </div>
      <div className="flex w-full justify-center">
        <div className="w-full max-w-4xl">
          <OptionList data={data} isLoading={isLoading} />
        </div>
      </div>
      <div className="h-24 w-full" />
      <div className="fixed bottom-0 flex w-full justify-center pb-5 pr-3 pl-3">
        <div className="flex w-full max-w-4xl justify-between">
          <button
            style={{ width: "48%" }}
            className="h-10 border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
          >
            Start Tournament
          </button>
          <button
            style={{ width: "48%" }}
            className="h-10 border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
          >
            New Choice
          </button>
        </div>
      </div>
    </div>
  );
};

interface OptionListProps {
  data: DecisionOption[] | undefined;
  isLoading: boolean;
}
interface DecisionOption {
  id: number;
  name: string;
  description?: string;
  url?: string;
  isDeleted: boolean;
}

const OptionList: FC<OptionListProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center">
        <Spinner className="-ml-1 mr-3 inline-block h-5 w-5 animate-spin text-black" />
      </div>
    );
  }
  if (!data) {
    return <div>Error loading the options</div>;
  }
  if (data.length === 0) {
    return <div>Wow such empty</div>;
  }
  return (
    <div>
      <div className="border-b-2 border-gray-300 pb-2 pl-5 text-xl">
        Options
      </div>
      <ul>
        {" "}
        {data.map((option) => (
          <li
            key={`option-${option.id}`}
            className="border-b-2 border-gray-300 p-1 pl-2 pr-2 hover:bg-gray-100"
          >
            <span className="inline">{option.name}</span>
            <span className="float-right mt-1 mr-2 inline cursor-pointer text-lg">
              <AiOutlineDelete />
            </span>
            <span className="float-right mt-1 mr-6 inline cursor-pointer text-lg">
              <AiOutlineEdit />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
