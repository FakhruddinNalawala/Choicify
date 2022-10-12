import { FC } from "react";

interface PageTitleBarProps {
  title: string;
  icon: JSX.Element;
}

export const PageTitleBar: FC<PageTitleBarProps> = ({ title, icon }) => {
  return (
    <div className="fixed top-0 flex w-full justify-center">
      <div className="relative z-20 w-full max-w-4xl rounded-b-2xl bg-white p-4 pt-2 text-center text-3xl shadow-[0_0_7px_2px_rgba(0,0,0,0.1)] shadow-gray-400">
        <span className="absolute left-0 mt-1 ml-4 flex">{icon}</span>
        <h2 className="inline-block text-center">{title}</h2>
      </div>
    </div>
  );
};
