import { FC, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { PageTitleBar } from "../../../components/PageTitleBar";
import { IoTrophyOutline } from "react-icons/io5";
import { TbTournament } from "react-icons/tb";
import { IDecisionList } from "../../lists";
import { DecisionOption } from "../edit";

export interface ITournament {
  id: number;
  currentMatchIndex: number;
  decisionList: IDecisionList;
  isDeleted: boolean;
  multiplayer: boolean;
  playerCount: number;
  startTime: number;
  date: string;
  winner: DecisionOption | null;
}

interface ITournamentProps {
  tournamet: ITournament;
}

export interface IListTournamentLoaderType {
  decisionList: IDecisionList;
  tournaments: ITournament[];
}

const Tournament: FC<ITournamentProps> = ({ tournamet }) => {
  return (
    <div className="relative mb-4 grid w-full grid-cols-4 rounded-lg border-2 border-gray-400 p-3 shadow-md shadow-gray-400">
      <div className="text-black">{tournamet.date}</div>
      <div className="text-center text-black">
        {tournamet.winner !== null ? tournamet.winner.name : "Not finish"}
      </div>
      <div className="text-center text-black">
        {tournamet.multiplayer
          ? `${tournamet.playerCount} player${
              tournamet.playerCount > 1 ? "s" : ""
            }`
          : "singleplayer"}
      </div>
      <div className="h-full text-black">
        <TbTournament className="float-right h-full cursor-pointer text-2xl hover:text-blue-600" />
      </div>
    </div>
  );
};

export const ListTournaments: FC = () => {
  const { decisionList: list, tournaments: tournamentList } =
    useLoaderData() as IListTournamentLoaderType;
  console.log(tournamentList);

  return (
    <div className="w-full">
      <PageTitleBar title="Tournaments" icon={<IoTrophyOutline />} />
      <div className="mt-20 flex w-full justify-center">
        <div className="w-full max-w-4xl px-4 text-center text-4xl">
          {list.question}
        </div>
      </div>
      <div className="mt-1 flex w-full justify-center">
        {tournamentList.length === 0 ? (
          <div className="max-w-4xl px-4 text-center">
            Oh! You don't have any tournaments played for this list
          </div>
        ) : (
          <div className="w-full max-w-4xl p-4">
            {tournamentList.map((tournament) => (
              <Tournament
                key={`tourny-${tournament.id}`}
                tournamet={tournament}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
