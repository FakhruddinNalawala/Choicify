import "../styles/globals.css";
import "../styles/LogIn.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { ReactElement, Suspense } from "react";
import { ProfileLayout } from "../components/ProfileLayout";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={"Loading..."}>
        <ProfileLayout>
          <Component {...pageProps} />
        </ProfileLayout>
      </Suspense>
    </QueryClientProvider>
  );
}

export default MyApp;
