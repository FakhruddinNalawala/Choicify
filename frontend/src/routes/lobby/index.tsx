import { useQuery, useQueryClient } from "@tanstack/react-query";
import Pusher, { Members, PresenceChannel } from "pusher-js";
import { FC, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getToken, request } from "../../utils/sessionUtils";
import {
  DecisionOption,
  LobbyCode,
  LobbyPlayer,
  OptionList,
  PlayerList,
} from "../decisionList/edit";

let pusher: Pusher | undefined;
interface Lobby {
  id: number;
  question: string;
  lobbyCode: string;
}

export const Lobby: FC = () => {
  const lobby = useLoaderData() as Lobby;
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<DecisionOption[], Error>(
    [`options-${lobby.id}`],
    async () => {
      let res = await request(`/api/lobby/${lobby.id}/options`);
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.json();
    }
  );

  useEffect(() => {
    if (lobby === undefined) {
      if (pusher !== undefined) {
        pusher.disconnect();
        pusher = undefined;
        setPlayers([]);
      }
    } else {
      if (pusher === undefined) {
        pusher = new Pusher("6ade24dc33f072ea8a2e", {
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
        let presenceChannel: PresenceChannel = pusher.subscribe(
          `presence-lobby-${lobby.id}`
        ) as PresenceChannel;
        presenceChannel.bind("pusher:subscription_succeeded", () => {
          setPlayers(Object.values(presenceChannel.members.members));
        });
        presenceChannel.bind("pusher:member_added", () => {
          setPlayers(Object.values(presenceChannel.members.members));
        });
        presenceChannel.bind("pusher:member_removed", () => {
          setPlayers(Object.values(presenceChannel.members.members));
        });
        presenceChannel.bind("options-update", () => {
          queryClient.invalidateQueries([`options-${lobby.id}`]);
        });
        presenceChannel.bind("remove-user", (id: number) => {
          if (id === presenceChannel.members.me.id) {
            toast.info("You have been kicked from the lobby");
            navigate("/");
          }
        });
        presenceChannel.bind("lobby-deleted", () => {
          toast.info("The lobby has been deleted by the owner");
          navigate("/");
        });
      }
    }
    return () => {
      if (pusher !== undefined) {
        pusher.disconnect();
        pusher = undefined;
        setPlayers([]);
      }
    };
  }, [lobby]);

  return (
    <div>
      <div className="mt-20 flex w-full justify-center">
        <h1 className="m-4 w-full max-w-4xl text-center text-2xl">
          {lobby.question}
        </h1>
      </div>
      <div className="flex w-full justify-center">
        <div className="w-full max-w-4xl text-center text-4xl">
          <LobbyCode code={lobby.lobbyCode} />
        </div>
      </div>
      <div className="flex w-full justify-center">
        <div className="w-full max-w-4xl">
          <OptionList data={data} isLoading={isLoading} />
        </div>
      </div>
      <div className="mt-8 flex w-full justify-center pr-4 pl-4">
        <div className="w-full max-w-4xl">
          <PlayerList players={players} />
        </div>
      </div>
    </div>
  );
};
