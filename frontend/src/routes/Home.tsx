import { FC } from "react";
import { Transition } from "@headlessui/react";
import "./Home.css";

export const Home: FC = () => {
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
      />
      <button
        style={{ fontFamily: "'Dangrek', cursive" }}
        placeholder="Tournament ID"
        className="h-10 w-56 border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none lg:w-64"
      >
        Join
      </button>
      <div
        className="absolute bottom-10 w-full text-center"
        style={{ fontFamily: "Dangrek" }}
      >
        <button className="h-16 w-16 rounded-full border-2 border-black text-center text-5xl shadow-md hover:shadow-gray-400">
          +
        </button>
      </div>
    </div>
  );
};
