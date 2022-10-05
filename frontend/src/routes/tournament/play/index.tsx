import { useQuery } from "@tanstack/react-query";
import Pusher, { PresenceChannel } from "pusher-js";
import { FC, useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import { Spinner } from "../../../components/Spinner";
import { getToken, request } from "../../../utils/sessionUtils";
import { DecisionOption, LobbyPlayer } from "../../decisionList/edit";

let pusher: Pusher | undefined;

interface Match {
  id: number;
  option1: DecisionOption;
  option2: DecisionOption;
  votesFor1: number;
  votesFor2: number;
  winner: DecisionOption | null;
  totalVotes: number;
  isFinal: boolean;
}

interface Tournament {
  id: number;
  question: string;
  isPrimary: boolean;
  currentMatch: Match;
  playerCount: number;
  hasVoted: boolean;
  haveVoted: TournamentPlayer[];
  haveNotVoted: TournamentPlayer[];
}

interface IVotes {
  voteCount: number;
  totalPlayers: number;
}

interface TournamentPlayer {
  id: number;
  name: string;
  hasVoted: boolean;
}

interface IPlayersStatus {
  haveVoted: TournamentPlayer[];
  haveNotVoted: TournamentPlayer[];
}

interface IWinner {
  option: DecisionOption;
  votes: number;
  totalVotes: number;
  isFinal: boolean;
}

export const PlayTournament: FC = () => {
  const tournament = useLoaderData() as Tournament;
  const [votes, setVotes] = useState<IVotes>({
    voteCount: tournament.currentMatch.totalVotes,
    totalPlayers: tournament.playerCount,
  });
  const [hasVoted, setHasVoted] = useState(tournament.hasVoted);
  const [playersStatus, setPlayersStatus] = useState<IPlayersStatus>({
    haveVoted: tournament.haveVoted,
    haveNotVoted: tournament.haveNotVoted,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<IWinner | undefined>(undefined);

  const [currentMatch, setCurrentMatch] = useState<Match | undefined>(
    tournament.currentMatch
  );
  const [loadingCurrentMatch, setLoadingCurrentMatch] = useState(false);

  const [showFinishMatchScreen, setShowFinishMatchScreen] = useState(false);

  const fetchNextMatch = async (isFinal: boolean = false) => {
    if (isFinal) return;
    setLoadingCurrentMatch(true);
    setCurrentMatch(undefined);
    let res = await request(`/api/tournament/${tournament.id}/match`);
    if (!res.ok) {
      toast.error((await res.json()).message);
    } else {
      let nextMatch: Match = await res.json();
      setCurrentMatch(nextMatch);
      setLoadingCurrentMatch(false);
    }
  };

  const getVoteCount = async (isFinal: boolean = false) => {
    if (isFinal) return;
    let res = await request(`/api/tournament/${tournament.id}/votes`);
    if (!res.ok) {
      toast.error((await res.json()).message);
    } else {
      let votesObj: IVotes = await res.json();
      setVotes(votesObj);
      if (
        tournament.isPrimary &&
        votesObj.totalPlayers === votesObj.voteCount
      ) {
        finishMatch();
      }
    }
  };

  const finishMatch = async () => {
    setShowFinishMatchScreen(true);
    setIsLoading(true);
    setWinner(undefined);
    let res = await request(`/api/tournament/${tournament.id}/finish_match`, {
      method: "POST",
    });
    if (!res.ok) {
      toast.error((await res.json()).message);
      setShowFinishMatchScreen(false);
    }
  };

  const getWinner = async (matchId: number) => {
    setIsLoading(true);
    setShowFinishMatchScreen(true);
    setWinner(undefined);
    let res = await request(
      `/api/tournament/${tournament.id}/match/${matchId}/winner`
    );
    if (!res.ok) {
      toast.error((await res.json()).message);
      setShowFinishMatchScreen(false);
    } else {
      setWinner(await res.json());
      setIsLoading(false);
    }
  };

  const getPlayers = async (isFinal: boolean = false) => {
    if (isFinal) return;
    let res = await request(`/api/tournament/${tournament.id}/players`);
    if (!res.ok) {
      toast.error((await res.json()).message);
    } else {
      let playersStatus: IPlayersStatus = await res.json();
      setPlayersStatus(playersStatus);
    }
  };

  const vote = async (for1or2: number) => {
    let req = request(`/api/tournament/${tournament.id}/vote/${for1or2}`, {
      method: "POST",
    });
    setHasVoted(true);
    let res = await req;
    if (!res.ok) {
      toast.error((await res.json()).message);
    }
  };

  useEffect(() => {
    if (tournament === undefined) {
      if (pusher !== undefined) {
        pusher.disconnect();
        pusher = undefined;
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
          `presence-tournament-${tournament.id}`
        ) as PresenceChannel;
        presenceChannel.bind("votes-changed", () => {
          getVoteCount();
          getPlayers();
        });
        presenceChannel.bind(
          "match-finished",
          ({ id, wasFinal }: { id: number; wasFinal: boolean }) => {
            getWinner(id);
            fetchNextMatch(wasFinal);
            getVoteCount(wasFinal);
            getPlayers(wasFinal);
          }
        );
      }
    }
    return () => {
      if (pusher !== undefined) {
        pusher.disconnect();
        pusher = undefined;
      }
    };
  }, [tournament]);

  return (
    <>
      <div className="mt-20 flex w-full justify-center">
        <div className="w-full max-w-4xl text-center text-3xl">
          {tournament.question}
        </div>
      </div>
      {}
      <div className="flex h-10 w-full justify-center">
        {!showFinishMatchScreen ? <VoteCount votes={votes} /> : null}
      </div>
      <div className="flex w-full justify-center">
        {showFinishMatchScreen ? (
          <div className="mt-5 w-full max-w-4xl">
            {isLoading ? (
              <div>Loading results</div>
            ) : winner ? (
              winner.isFinal ? (
                <div className="p-3 text-center text-4xl">
                  The tournament winner is {winner.option.name}
                </div>
              ) : (
                <div className="p-3 text-center text-2xl">
                  {winner.option.name} with {winner.votes} / {winner.totalVotes}{" "}
                  votes
                </div>
              )
            ) : (
              <div>No data</div>
            )}
            {winner && winner.isFinal ? null : (
              <div className="mt-3 w-full text-center">
                <button
                  onClick={() => {
                    setHasVoted(false);
                    setShowFinishMatchScreen(false);
                  }}
                  className="rounded-md border-2 border-gray-400 p-2 shadow-md shadow-gray-300 hover:bg-gray-50"
                >
                  Go to next match
                </button>
              </div>
            )}
          </div>
        ) : hasVoted ? (
          <div className="w-full max-w-4xl">
            {tournament.isPrimary ? (
              <div className="mt-2 mb-2 w-full text-center">
                <button
                  onClick={() => {
                    finishMatch();
                  }}
                  className="rounded-md border-2 border-gray-400 p-2 shadow-md shadow-gray-300 hover:bg-gray-50"
                >
                  Move to next
                </button>
              </div>
            ) : (
              <div className="text-center">
                Waiting for host to move to next match
              </div>
            )}
            <ShowVotingStatus
              haveVoted={playersStatus.haveVoted}
              haveNotVoted={playersStatus.haveNotVoted}
            />
          </div>
        ) : (
          <>
            {loadingCurrentMatch ? (
              <div className="absolute bottom-0 w-full max-w-4xl p-5 pb-20">
                <div className="flex w-full justify-center">
                  <Spinner className="-ml-1 mr-3 inline-block h-24 w-24 animate-spin text-black" />
                </div>
              </div>
            ) : currentMatch === undefined ? (
              <div>Error getting the match</div>
            ) : (
              <MakeChoice
                option1={currentMatch.option1}
                option2={currentMatch.option2}
                vote={vote}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

interface MakeChoiceProps {
  option1: DecisionOption;
  option2: DecisionOption;
  vote: (for1or2: number) => void;
}

export const ShowVotingStatus: FC<{
  haveVoted: TournamentPlayer[];
  haveNotVoted: TournamentPlayer[];
}> = ({ haveVoted, haveNotVoted }) => {
  return (
    <div className="p-2">
      <div className="mt-3 pb-2 pl-5 text-xl">Voted:</div>
      <div className="flex flex-wrap">
        {haveVoted.map((player) => (
          <div
            className="m-1 rounded-2xl border-2 border-gray-500 p-1 shadow-sm shadow-gray-400"
            key={`player-${player.id}`}
          >
            <img
              src={`/api/profile/picture/${player.id}.svg`}
              className={`mr-2 ml-2 inline-block h-8 w-8 rounded-full bg-white`}
            />
            <span className="mr-2 inline-block">{player.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pb-2 pl-5 text-xl">Have not voted:</div>
      <div className="flex flex-wrap">
        {haveNotVoted.map((player) => (
          <div
            className="m-1 rounded-2xl border-2 border-gray-500 p-1 shadow-sm shadow-gray-400"
            key={`player-${player.id}`}
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

const VoteCount: FC<{ votes: IVotes }> = ({ votes }) => {
  return (
    <div>
      {votes.voteCount} / {votes.totalPlayers}
    </div>
  );
};

const MakeChoice: FC<MakeChoiceProps> = ({ option1, option2, vote }) => {
  return (
    <div className="absolute bottom-0 w-full max-w-4xl p-5">
      <div className="flex w-full justify-center">
        <div
          className="w-full cursor-pointer rounded-xl border-2 border-gray-300 p-2 shadow-md shadow-gray-300 hover:bg-gray-50 hover:shadow-lg hover:shadow-gray-400 md:max-w-lg"
          onClick={() => {
            if (Math.random() > 0.5) {
              vote(1);
            } else {
              vote(2);
            }
          }}
        >
          <h3 className="text-center">Toss a coin</h3>
        </div>
      </div>
      <div className="flex flex-col md:flex-row">
        <div
          className="relative mt-4 h-52 w-full cursor-pointer rounded-xl border-2 border-gray-300 p-2 shadow-md shadow-gray-400 hover:bg-gray-50 hover:shadow-lg hover:shadow-gray-500 md:mr-2 md:h-96"
          onClick={() => {
            vote(1);
          }}
        >
          <h3 className="text-center text-xl">{option1.name}</h3>
          {option1.description !== undefined && option1.description !== null ? (
            <div className="h-28 p-2 md:h-64">{option1.description}</div>
          ) : null}
          {option1.url !== undefined && option1.url !== null ? (
            <div className="absolute bottom-3 left-0 block w-full">
              <div className="flex w-full justify-center">
                <a
                  className="inline-block h-7 w-11/12 overflow-hidden rounded-md border-2 border-gray-400 pr-2 pl-2 text-center"
                  href={
                    option1.url.includes("https")
                      ? option1.url
                      : `https://${option1.url}`
                  }
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  {option1.url}
                </a>
              </div>
            </div>
          ) : null}
        </div>
        <div
          className="relative mt-4 h-52 w-full cursor-pointer rounded-xl border-2 border-gray-300 p-2 shadow-md shadow-gray-400 hover:bg-gray-50 hover:shadow-lg hover:shadow-gray-500 md:ml-2 md:h-96"
          onClick={() => {
            vote(2);
          }}
        >
          <h3 className="text-center text-xl">{option2.name}</h3>
          {option2.description !== undefined && option2.description !== null ? (
            <div className="h-28 p-2 md:h-64">{option2.description}</div>
          ) : null}
          {option2.url !== undefined && option2.url !== null ? (
            <div className="absolute bottom-3 left-0 block w-full">
              <div className="flex w-full justify-center">
                <a
                  className="inline-block h-7 w-11/12 overflow-hidden rounded-md border-2 border-gray-400 pr-2 pl-2 text-center"
                  href={
                    option2.url.includes("https")
                      ? option2.url
                      : `https://${option2.url}`
                  }
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  {option2.url}
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
