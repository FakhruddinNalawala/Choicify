import type { NextPage } from "next";
import Head from "next/head";
import { LogIn } from "../components/LogIn";
import { useContext } from "react";
import { logInContext } from "../components/ProfileLayout";

const Home: NextPage = () => {
  const {isLogIn} = useContext(logInContext);

  return (
    <div>
      <Head>
        <title>Choicify</title>
      </Head>
      <main>
        <div className="text-center text-3xl font-bold">Choicify</div>
        {isLogIn ? <div>You are in!</div> : <div><LogIn /></div>}
      </main>
    </div>
  );
};

export default Home;
