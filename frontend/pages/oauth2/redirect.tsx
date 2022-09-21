import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { logInContext } from "../../components/ProfileLayout";
import { useToken } from "../../utils/sessionUtils";

let token: string | null = null;
if (typeof window !== "undefined") {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop as string),
  }) as any;
  token = params.token;
}

const OauthRedirect: NextPage = () => {
  const router = useRouter();
  const {setLogIn} = useContext(logInContext);
  const {setAccessToken} = useToken(setLogIn);
  useEffect(() => {
    if (token) {
      setAccessToken(token)
      router.push("/");
    }
  }, [])

  return (
    <div>
      <Head>
        <title>Signing in to Choicify</title>
      </Head>
      <main>
        <div>Hi there</div>
      </main>
    </div>
  );
};

export default OauthRedirect;
