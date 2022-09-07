import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useQuery } from "@tanstack/react-query";

const Home: NextPage = () => {
  const { data, isLoading, isError, error } = useQuery<String, Error>(
    ["nextTest"],
    async () => {
      const response = await fetch("/api/next", { method: "GET" });
      if (!response.ok) {
        throw new Error("Error in the request");
      }
      return response.text();
    }
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>Example of how to request data from Spring</title>
      </Head>
      <main>
        <div className="text-3xl font-bold underline">
          {isLoading ? (
            <div className="">Loading request from Spring</div>
          ) : isError ? (
            <div>
              <>Error: {error.message}</>
            </div>
          ) : (
            <div>Data: {data}</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
