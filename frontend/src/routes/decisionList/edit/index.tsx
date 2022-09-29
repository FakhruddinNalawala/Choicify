import { Transition } from "@headlessui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineEdit,
} from "react-icons/ai";
import { useLoaderData } from "react-router-dom";
import { Id, toast } from "react-toastify";
import { Spinner } from "../../../components/Spinner";
import { request } from "../../../utils/sessionUtils";

interface DecisionList {
  id: number;
  question: string;
}

export const EditDecisionList: FC = () => {
  const decisionList = useLoaderData() as DecisionList;
  const [showCreateNewOption, setShowCreateNewOption] = useState(false);

  const [editId, setEditId] = useState<number | undefined>(undefined);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const toastIdRef = useRef<Id | null>(null);

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
  const queryClient = useQueryClient();
  const { mutate } = useMutation<DecisionOption, Error, DecisionOption>(
    async (newOption) => {
      let res = await request(
        `/api/decisionList/${decisionList.id}/options/new`,
        {
          method: "POST",
          body: JSON.stringify(newOption),
        }
      );
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.json();
    },
    {
      onMutate: async (newOption) => {
        newOption.id = Math.floor(Math.random() * 100_000_000);
        newOption.isOptimistic = true;
        const previousOptions = queryClient.getQueryData([
          `options-${decisionList.id}`,
        ]);
        queryClient.setQueryData<DecisionOption[]>(
          [`options-${decisionList.id}`],
          (old) => {
            if (old === undefined) return [newOption];
            return [...old, newOption];
          }
        );
        return { previousOptions };
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries([`options-${decisionList.id}`]);
      },
    }
  );

  const onSubmitNewOption = useCallback(() => {
    if (toastIdRef.current !== null) {
      toast.dismiss(toastIdRef.current);
    }
    if (editName === "") {
      toastIdRef.current = toast.error("Name cannot be empty");
    } else {
      mutate({
        name: editName,
        description: editDescription || undefined,
        url: editUrl || undefined,
      });
      setEditName("");
      setEditDescription("");
      setEditUrl("");
    }
  }, [editName, editDescription, editUrl]);

  const onCloseNewOption = useCallback(() => {
    if (editId !== undefined) {
      setEditName("");
      setEditDescription("");
      setEditUrl("");
      setEditId(undefined);
    }
    setShowCreateNewOption(false);
  }, [editId]);

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
          <OptionList
            data={data}
            isLoading={isLoading}
            onEdit={(id) => {
              if (data === undefined) return;
              for (let option of data) {
                if (option.id === id) {
                  setEditId(option.id);
                  setEditName(option.name);
                  setEditDescription(option.description || "");
                  setEditUrl(option.url || "");
                  setShowCreateNewOption(true);
                  return;
                }
              }
            }}
          />
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
            onClick={() => setShowCreateNewOption(true)}
          >
            New Choice
          </button>
        </div>
      </div>
      <div className="flex w-full justify-center">
        <CreateNewOptionPanel
          show={showCreateNewOption}
          close={onCloseNewOption}
          submit={onSubmitNewOption}
          id={editId}
          name={editName}
          description={editDescription}
          url={editUrl}
          setName={setEditName}
          setDescription={setEditDescription}
          setUrl={setEditUrl}
        />
      </div>
    </div>
  );
};

interface OptionListProps {
  data: DecisionOption[] | undefined;
  isLoading: boolean;
  onEdit: (id: number) => void;
}
interface DecisionOption {
  id?: number;
  name: string;
  description?: string;
  url?: string;
  isDeleted?: boolean;
  isOptimistic?: boolean;
}

const OptionList: FC<OptionListProps> = ({ data, isLoading, onEdit }) => {
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
            <span
              className="float-right mt-1 mr-6 inline cursor-pointer text-lg"
              onClick={() => {
                if (option.isOptimistic || option.id === undefined) return; // don't let the user update optimistic options
                onEdit(option.id);
              }}
            >
              <AiOutlineEdit />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface CreateNewOptionPanelProps {
  show: boolean;
  close: () => void;
  submit: () => void;
  id: number | undefined;
  name: string;
  description: string;
  url: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
}

const CreateNewOptionPanel: FC<CreateNewOptionPanelProps> = ({
  show,
  close,
  submit,
  id,
  name,
  description,
  url,
  setName,
  setDescription,
  setUrl,
}) => {
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Transition
      show={show}
      className="fixed bottom-0 z-30 h-80 w-full max-w-4xl rounded-t-2xl bg-white p-4 shadow-[0_0_7px_2px_rgba(0,0,0,0.1)] shadow-gray-400"
      enter="transition ease-in-out duration-200 transform"
      enterFrom="translate-y-full"
      enterTo="translate-y-0"
      leave="transition ease-in-out duration-200 transform"
      leaveFrom="translate-y-0"
      leaveTo="translate-y-full"
      afterEnter={() => {
        if (nameInputRef.current !== null) {
          nameInputRef.current.focus();
        }
      }}
    >
      <div className="text-xl">
        {id === undefined ? "Create a new option" : "Edit option"}
      </div>
      <input
        ref={nameInputRef}
        type="text"
        placeholder="name"
        className="mt-3 w-full outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="description"
        className="mt-3 h-28 w-full resize-none outline-none"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="do you want to add a link? paste it here"
        className="mt-3 w-full outline-none"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        className="absolute bottom-5 right-10 h-10 w-10 rounded-full p-1 text-center text-2xl shadow-sm shadow-gray-400 hover:shadow-none"
        onClick={() => {
          submit();
          if (nameInputRef.current !== null) {
            nameInputRef.current.focus();
          }
        }}
      >
        <div className="flex h-full w-full items-center justify-center">
          <AiOutlineCheck />
        </div>
      </button>
      <button
        className="absolute bottom-5 left-10 h-10 w-10 rounded-full p-1 text-center text-2xl shadow-sm shadow-gray-400 hover:shadow-none"
        onClick={close}
      >
        <div className="flex h-full w-full items-center justify-center">
          <AiOutlineClose />
        </div>
      </button>
    </Transition>
  );
};
