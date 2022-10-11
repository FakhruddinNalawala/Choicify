import { Transition } from "@headlessui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Pusher, { Members, PresenceChannel } from "pusher-js";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineEdit,
} from "react-icons/ai";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Id, toast } from "react-toastify";
import { Spinner } from "../../../components/Spinner";
import { getToken, request } from "../../../utils/sessionUtils";

let pusher: Pusher | undefined;
export interface DecisionList {
  id: number;
  question: string;
}

export const EditDecisionList: FC = () => {
  const decisionList = useLoaderData() as DecisionList;
  const navigate = useNavigate();
  const [showCreateNewOption, setShowCreateNewOption] = useState(false);

  const [editId, setEditId] = useState<number | undefined>(undefined);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const [isMultiplayer, setIsMultiplayer] = useState(false);

  const [players, setPlayers] = useState<LobbyPlayer[]>([]);

  const [mePlayer, setMePlayer] = useState<LobbyPlayer | undefined>(undefined);

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
  const { mutate: update } = useMutation<DecisionOption, Error, DecisionOption>(
    async (updateOption) => {
      let res = await request(
        `/api/decisionList/${decisionList.id}/options/${updateOption.id}/edit`,
        {
          method: "PUT",
          body: JSON.stringify(updateOption),
        }
      );
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.json();
    },
    {
      onMutate: async (updateOption) => {
        updateOption.isOptimistic = true;
        const previousOptions = queryClient.getQueryData([
          `options-${decisionList.id}`,
        ]);
        queryClient.setQueryData<DecisionOption[]>(
          [`options-${decisionList.id}`],
          (old) => {
            if (old === undefined) return [updateOption];
            let newOptions = [...old];
            for (let i = 0; i < newOptions.length; i++) {
              if (newOptions[i].id === updateOption.id) {
                newOptions[i] = updateOption;
                return newOptions;
              }
            }
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
  const { mutate: deleteOption } = useMutation<number, Error, number>(
    async (optionId) => {
      let res = await request(
        `/api/decisionList/${decisionList.id}/options/${optionId}/delete`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.json();
    },
    {
      onMutate: async (optionId) => {
        const previousOptions = queryClient.getQueryData([
          `options-${decisionList.id}`,
        ]);
        queryClient.setQueryData<DecisionOption[]>(
          [`options-${decisionList.id}`],
          (old) => {
            if (old === undefined) return undefined;
            if (old.length === 0) return [];
            let newOptions = [...old];
            for (let i = 0; i < newOptions.length; i++) {
              if (newOptions[i].id === optionId) {
                newOptions.splice(i, 1);
                return newOptions;
              }
            }
            return newOptions;
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

  const {
    mutate: makeMultiplayer,
    data: lobby,
    isLoading: isLoadingMultiplayer,
  } = useMutation<{ id: number; lobbyCode: string }, Error>(
    async () => {
      let res = await request(
        `/api/decisionList/${decisionList.id}/createLobby`,
        {
          method: "POST",
        }
      );
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.json();
    },
    {
      onMutate: async () => {
        setIsMultiplayer(true);
      },
      onError: (error) => {
        toast.error(error.message);
        setIsMultiplayer(false);
      },
    }
  );
  const { mutate: makeSingleplayer } = useMutation<string, Error>(
    async () => {
      let res = await request(
        `/api/decisionList/${decisionList.id}/deleteLobby`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.text();
    },
    {
      onMutate: async () => {
        setIsMultiplayer(false);
        setPlayers([]);
      },
      onError: (error) => {
        toast.error(error.message);
        setIsMultiplayer(true);
      },
      onSuccess: () => {
        if (pusher !== undefined) {
          pusher.disconnect();
        }
      },
    }
  );

  const { mutate: startTournament, isLoading: creatingNewTournament } =
    useMutation<number, Error>(
      async () => {
        let res = await request("/api/tournament/new", {
          method: "POST",
          body: JSON.stringify({
            decisionListId: decisionList.id,
            playerIds: players.map((player) => player.id),
          }),
        });
        if (!res.ok) {
          throw new Error((await res.json()).message);
        }
        return await res.json();
      },
      {
        onError: (error) => {
          toast.error(error.message);
        },
        onSuccess: (tournamentId) => {
          if (!isMultiplayer) {
            navigate(`/tournament/play/${tournamentId}`);
          }
        },
      }
    );

  useEffect(() => {
    if (lobby === undefined) {
      if (pusher !== undefined) {
        pusher.disconnect();
        pusher = undefined;
        setPlayers([]);
        setMePlayer(undefined);
      }
    } else {
      if (pusher === undefined) {
        pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
          cluster: "ap4",
          userAuthentication: {
            endpoint: "/api/pusher/auth",
            transport: "ajax",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
          channelAuthorization: {
            endpoint: "/api/pusher/auth",
            transport: "ajax",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        });
      }
      let presenceChannel: PresenceChannel = pusher.subscribe(
        `presence-lobby-${lobby.id}`
      ) as PresenceChannel;
      presenceChannel.bind("pusher:subscription_succeeded", () => {
        setMePlayer(presenceChannel.members.me);
        setPlayers(Object.values(presenceChannel.members.members));
      });
      presenceChannel.bind("pusher:member_added", () => {
        setPlayers(Object.values(presenceChannel.members.members));
      });
      presenceChannel.bind("pusher:member_removed", () => {
        setPlayers(Object.values(presenceChannel.members.members));
      });
      presenceChannel.bind("tournament-started", (id: number) => {
        navigate(`/tournament/play/${id}`);
      });
    }
    return () => {
      if (pusher !== undefined) {
        pusher.disconnect();
        pusher = undefined;
        setPlayers([]);
      }
    };
  }, [lobby]);

  useOnUnmount(() => {
    if (isMultiplayer) {
      makeSingleplayer();
    }
  }, [isMultiplayer]);

  const disconnectUser = async (id: number, prevPlayers: LobbyPlayer[]) => {
    if (lobby === undefined) return;
    let requested = request(`/api/lobby/${lobby.id}/terminate/${id}`, {
      method: "POST",
    });
    let newPlayers = [...prevPlayers];
    for (let i = 0; i < newPlayers.length; i++) {
      if (newPlayers[i].id === id) {
        newPlayers.splice(i, 1);
        break;
      }
    }
    setPlayers(newPlayers);
    let res = await requested;
    if (!res.ok) {
      setPlayers([...prevPlayers]);
    }
  };

  const onSubmitNewOption = useCallback(() => {
    if (toastIdRef.current !== null) {
      toast.dismiss(toastIdRef.current);
    }
    if (editName === "") {
      toastIdRef.current = toast.error("Name cannot be empty");
    } else {
      if (editId === undefined) {
        mutate({
          name: editName,
          description: editDescription || undefined,
          url: editUrl || undefined,
        });
      } else {
        update({
          id: editId,
          name: editName,
          description: editDescription || undefined,
          url: editUrl || undefined,
        });
      }
      setEditId(undefined);
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
          <button
            onClick={() => {
              if (isMultiplayer) {
                makeSingleplayer();
              } else {
                makeMultiplayer();
              }
            }}
            className="h-10 w-9/12 border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
          >
            {isMultiplayer ? "Multiplayer" : "Singleplayer"}
          </button>
        </div>
      </div>
      <div className="mt-20 flex w-full justify-center">
        <h1 className="m-4 w-full max-w-4xl text-center text-2xl">
          {decisionList.question}
        </h1>
      </div>
      {isMultiplayer ? (
        <div className="flex w-full justify-center">
          <div className="w-full max-w-4xl text-center text-4xl">
            {isLoadingMultiplayer ? (
              <Spinner className="-ml-1 mr-3 inline-block h-5 w-5 animate-spin text-black" />
            ) : (
              <LobbyCode code={lobby?.lobbyCode} />
            )}
          </div>
        </div>
      ) : null}
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
            onDelete={deleteOption}
          />
        </div>
      </div>
      {isMultiplayer ? (
        <div className="mt-8 flex w-full justify-center pr-4 pl-4">
          <div className="w-full max-w-4xl">
            <PlayerList
              players={players}
              mePlayer={mePlayer}
              onClickPlayer={disconnectUser}
            />
          </div>
        </div>
      ) : null}
      <div className="h-24 w-full" />
      <div className="fixed bottom-0 flex w-full justify-center pb-5 pr-3 pl-3">
        <div className="flex w-full max-w-4xl justify-between">
          <button
            disabled={isLoading}
            style={{ width: "48%" }}
            className="h-10 border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
            onClick={() => startTournament()}
          >
            {isLoading ? (
              <Spinner className="-ml-1 mr-3 inline-block h-5 w-5 animate-spin text-black" />
            ) : null}
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
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}
export interface DecisionOption {
  id?: number;
  name: string;
  description?: string | null;
  url?: string | null;
  isDeleted?: boolean;
  isOptimistic?: boolean;
}

export const OptionList: FC<OptionListProps> = ({
  data,
  isLoading,
  onEdit,
  onDelete,
}) => {
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
  return (
    <div>
      <div className="border-b-2 border-gray-300 pb-2 pl-5 text-xl">
        Options
      </div>
      {data.length === 0 ? (
        <div className="mt-2 text-center">Wow such empty</div>
      ) : (
        <ul>
          {data.map((option) => (
            <li
              key={`option-${option.id}`}
              className="border-b-2 border-gray-300 p-1 pl-2 pr-2 hover:bg-gray-100"
            >
              <span className="inline">{option.name}</span>
              {onDelete !== undefined ? (
                <span
                  className="float-right mt-1 mr-2 inline cursor-pointer text-lg"
                  onClick={() => {
                    if (option.isOptimistic || option.id === undefined) return;
                    onDelete(option.id);
                  }}
                >
                  <AiOutlineDelete />
                </span>
              ) : null}
              {onEdit !== undefined ? (
                <span
                  className="float-right mt-1 mr-6 inline cursor-pointer text-lg"
                  onClick={() => {
                    if (option.isOptimistic || option.id === undefined) return; // don't let the user update optimistic options
                    onEdit(option.id);
                  }}
                >
                  <AiOutlineEdit />
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
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

export const LobbyCode: FC<{ code: string | undefined }> = ({ code }) => {
  if (code === undefined) return null;
  return (
    <div>
      {code.split("").map((char, index) => (
        <span
          key={`char-${index}`}
          className={
            char[0] >= "0" && char[0] <= "9" ? "text-blue-700" : "text-black"
          }
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export interface LobbyPlayer {
  id: number;
  name: string;
}

export const PlayerList: FC<{
  players: LobbyPlayer[];
  mePlayer?: LobbyPlayer;
  onClickPlayer?: (id: number, players: LobbyPlayer[]) => void;
}> = ({ players, mePlayer, onClickPlayer }) => {
  const extraStyle: string | null =
    mePlayer !== undefined ? "cursor-pointer" : "cursor-not-allowed";
  return (
    <div>
      <div className="pb-2 pl-5 text-xl">Players</div>
      <div className="flex flex-wrap">
        {players.map((player) => (
          <div
            className={`m-1 rounded-2xl border-2 border-gray-500 p-1 shadow-sm shadow-gray-400 ${
              mePlayer?.id === player.id ? "cursor-not-allowed" : extraStyle
            }`}
            key={`player-${player.id}`}
            onClick={() => {
              if (
                onClickPlayer === undefined ||
                mePlayer === undefined ||
                mePlayer.id === player.id
              )
                return;
              onClickPlayer(player.id, players);
            }}
          >
            <img
              src={`/api/profile/picture/${player.id}.svg`}
              className={`mr-2 ml-2 inline-block h-8 w-8 rounded-full bg-white`}
            />
            <span className="mr-2 inline-block">{player.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const useOnUnmount = (callback: () => void, dependencies: any[]) => {
  const isUnmounting = useRef(false);
  useEffect(() => {
    isUnmounting.current = false;
    return () => {
      isUnmounting.current = true;
    };
  }, []);
  useEffect(
    () => () => {
      if (isUnmounting.current) {
        callback();
      }
    },
    dependencies
  );
};
