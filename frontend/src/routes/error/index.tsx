import { FC } from "react";
import { Link, useRouteError } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";

export const ErrorPage: FC = () => {
  const error = useRouteError() as any;
  let errorContent: any;
  let errorElement: JSX.Element | undefined = undefined;
  try {
    errorContent = JSON.parse(error?.message);
  } catch {
    errorContent = error?.message;
  }
  if (errorContent) {
    if (typeof errorContent === "string") {
      errorElement = <span>{errorContent}</span>;
    } else if (typeof errorContent.message === "string") {
      errorElement = <span>{errorContent.message}</span>;
    } else {
    }
  }
  if (errorElement === undefined) {
    errorElement = <span>Ups! Seems like something went wrong</span>;
  }
  return (
    <div className="App" style={{ fontFamily: "Dangrek" }}>
      <Sidebar />
      <div className="flex h-screen w-full flex-col items-center justify-center text-center">
        <div className="flex w-full max-w-4xl justify-center p-4 text-2xl">
          <span>Oh no! An error ocurred while using Choicify</span>
        </div>
        <div className="flex w-full max-w-4xl justify-center p-4 text-xl">
          {errorElement}
        </div>
        <Link
          to="/"
          className="mt-4 flex h-10 w-56 items-center justify-center border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none lg:w-64"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};
