import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { removeToken, request } from "../utils/sessionUtils";
import { useQuery } from "@tanstack/react-query";
import { Transition } from "@headlessui/react";
import { BsListStars } from "react-icons/bs";
import { IoSettingsOutline, IoClose } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { AiOutlineHome } from "react-icons/ai";

interface PageButtonProps {
  icon: JSX.Element;
  text: string;
  to: string;
  onClick?: () => void;
}

const PageButton: FC<PageButtonProps> = ({ icon, text, to, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="inline-block w-full border-b-2 pt-3 pb-3 pl-3 text-center text-2xl"
    >
      <span className="absolute left-4 flex justify-center align-middle">
        {icon}
      </span>
      <span className="inline">{text}</span>
    </Link>
  );
};

export const Sidebar: FC = () => {
  const [show, setShow] = useState(false);
  const { data } = useQuery<any, Error>(["user-profile"], async () => {
    let res = await request("/api/profile", { credentials: "include" });
    if (!res.ok) {
      throw new Error("Failed to load user information");
    }
    return await res.json();
  });

  if (!data) return null;

  return (
    <div className="fixed top-0 right-0 z-50 min-h-[100px] min-w-[100px]">
      <Transition
        show={!show}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="absolute right-0 top-0"
      >
        <img
          src={`/api/profile/picture/${data.id}.svg`}
          className={`mr-4 mt-4 ml-auto h-16 w-16 rounded-full bg-white shadow-md shadow-gray-400 transition-transform duration-200 hover:cursor-pointer hover:shadow-none`}
          onClick={() => {
            setShow((state) => !state);
          }}
        />
      </Transition>
      <Transition
        show={show}
        enter="transition ease-in-out duration-200 transform"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-200 transform"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
        className="w-80"
      >
        <div className="h-screen rounded-l-xl bg-white shadow-md shadow-black">
          <div className="border-b-2 border-gray-300 p-4 text-center text-3xl">
            {data.givenName}
          </div>
          <PageButton
            to="/"
            icon={<AiOutlineHome />}
            text="Home"
            onClick={() => setShow(false)}
          />
          <PageButton
            to="/lists"
            icon={<BsListStars />}
            text="Lists"
            onClick={() => setShow(false)}
          />
          <PageButton
            to="/settings"
            icon={<IoSettingsOutline />}
            text="Settings"
            onClick={() => setShow(false)}
          />
          <div
            className="w-full cursor-pointer border-b-2 pt-3 pb-3 pl-3 text-center text-2xl"
            onClick={() => setShow(false)}
          >
            <span className="absolute left-4 flex justify-center align-middle">
              <IoClose />
            </span>
            <span className="inline">Close</span>
          </div>
          <Link
            to={"/login"}
            onClick={removeToken}
            className="absolute bottom-0 w-full cursor-pointer border-t-2 pt-3 pb-3 pl-3 text-center text-2xl"
          >
            <span className="absolute left-4 flex justify-center align-middle">
              <FiLogOut />
            </span>
            <span className="inline">Log out</span>
          </Link>
        </div>
      </Transition>
    </div>
  );
};
