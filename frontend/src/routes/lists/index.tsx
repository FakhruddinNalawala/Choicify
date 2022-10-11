import { FC, useState } from "react";
import { PageTitleBar } from "../../components/PageTitleBar";
import { BsListStars } from "react-icons/bs";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DecisionOption } from "../decisionList/edit";
import { request } from "../../utils/sessionUtils";
import { AiOutlineDelete } from "react-icons/ai";
import { Popover } from "@headlessui/react";
import { toast } from "react-toastify";
interface IDecisionList {
  id: number;
  question: string;
  is_deleted?: boolean | null;
}

interface DecisionListProps extends IDecisionList {
  onDelete: (id: number) => void;
}

const List: FC<DecisionListProps> = ({ id, question, onDelete }) => {
  const navigate = useNavigate();
  const { data: options } = useQuery<DecisionOption[], Error>(
    [`list-options-${id}`],
    async () => {
      let res = await request(`/api/decisionList/${id}/options`);
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.json();
    }
  );

  const { data: tournamentCount } = useQuery<number, Error>(
    [`list-tournament_count-${id}`],
    async () => {
      let res = await request(`/api/decisionList/${id}/tournament_count`);
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.json();
    }
  );

  return (
    <div
      className="relative mb-4 w-full rounded-lg border-2 border-gray-400 p-3 shadow-md shadow-gray-400 hover:border-blue-600 hover:text-blue-600"
      onClick={() => navigate(`/list/edit/${id}`)}
    >
      <div className="absolute top-0 right-0 mt-2 mr-2">
        <Popover className="relative">
          <Popover.Button className="outline-0">
            <AiOutlineDelete className="text-2xl text-black hover:text-red-600" />
          </Popover.Button>
          <Popover.Panel className="absolute right-0 z-10">
            {({ close }) => (
              <div className="flex">
                <button
                  className="mr-2 rounded-lg bg-red-600 p-2 text-white shadow-md shadow-gray-500 outline-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                >
                  Delete
                </button>
                <button
                  className="rounded-lg bg-gray-400 p-2 text-white shadow-md shadow-gray-500 outline-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    close();
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </Popover.Panel>
        </Popover>
      </div>
      <h3 className="text-center text-xl">{question}</h3>
      {options === undefined ? null : (
        <div className="mt-2 flex w-full flex-wrap justify-center">
          {options.map((option, index) => (
            <div
              key={`option-${option.id}`}
              className={`${
                index < options.length - 1 ? "mr-3 " : ""
              }rounded-xl border-2 border-gray-400 p-1 pl-2 pr-2 text-black`}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
      {tournamentCount === undefined ? null : (
        <Link
          className="text-black hover:text-blue-600"
          to={`/list/${id}/tournaments`}
          onClick={(e) => e.stopPropagation()}
        >
          {tournamentCount} tournament{tournamentCount > 1 ? "s" : ""}
        </Link>
      )}
    </div>
  );
};

export const Lists: FC = () => {
  const listsInit = useLoaderData() as IDecisionList[];
  const [lists, setLists] = useState<IDecisionList[]>(() => listsInit);

  const getLists = async () => {
    let res = await request(`/api/decisionList`);
    if (!res.ok) {
      toast.error(await res.text());
      return;
    }
    setLists(await res.json());
  };

  const { mutate: deleteList } = useMutation<number, Error, number>(
    async (listId) => {
      let res = await request(`/api/decisionList/${listId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.json();
    },
    {
      onMutate: async (listId) => {
        let newLists = [...lists];
        for (let i = 0; i < newLists.length; i++) {
          if (newLists[i].id === listId) {
            newLists.splice(i, 1);
            break;
          }
        }
        setLists(newLists);
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        getLists();
      },
    }
  );

  return (
    <div className="w-full">
      <PageTitleBar title="Lists" icon={<BsListStars />} />
      <div className="mt-20 flex w-full justify-center">
        {lists.length == 0 ? (
          <div>Oh! You have empty</div>
        ) : (
          <div className="w-full max-w-4xl p-4">
            {lists.map((list) => (
              <List
                key={`list-${list.id}`}
                id={list.id}
                question={list.question}
                onDelete={deleteList}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
