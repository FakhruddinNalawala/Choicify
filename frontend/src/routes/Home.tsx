import { FC, useState } from "react";
import { Transition } from "@headlessui/react";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";

export const Home: FC = () => {
  const [lobbyCode, setLobbyCode] = useState("");
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div
        style={{ fontFamily: "'Pacifico', cursive" }}
        className="mb-24 text-center text-7xl md:text-8xl lg:text-9xl"
      >
        Choicify
      </div>
      <input
        style={{ fontFamily: "'Dangrek', cursive" }}
        placeholder="Tournament ID"
        className="mb-7 h-10 w-56 border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none lg:w-64"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value)}
      />
      <button
        disabled={lobbyCode.length === 0}
        style={{ fontFamily: "'Dangrek', cursive" }}
        className="h-10 w-56 border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none lg:w-64"
        onClick={() => navigate(`/lobby/${lobbyCode}`)}
      >
        Join
      </button>
      <div
        className="absolute bottom-10 w-full text-center"
        style={{ fontFamily: "Dangrek" }}
      >
        <Link
          to="list/new"
          className="inline-flex h-16 items-center justify-center rounded-full border-2 border-black px-6 text-center text-2xl shadow-md hover:shadow-gray-400"
        >
          Create New Tournament
        </Link>
      </div>
      <div className="absolute top-0 right-0 mt-4 mr-24 flex h-16 items-center justify-end text-xl">
        Click on your profile image -&gt;
      </div>
    </div>
  );
};
