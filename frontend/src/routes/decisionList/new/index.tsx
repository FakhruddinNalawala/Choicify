import { useMutation } from "@tanstack/react-query";
import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "../../../components/Spinner";
import { request } from "../../../utils/sessionUtils";
import { toast } from "react-toastify";

const LINE_HEIGHT = 20;
const EXTRA_HEIGHT = 24;
const getNumberOfLinesTextarea = (scrollHeight: number): number => {
  return Math.ceil((scrollHeight - EXTRA_HEIGHT) / LINE_HEIGHT);
};

export const NewDecisionList: FC = () => {
  const [textAreaLines, setTextAreaLines] = useState(1);
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();

  const { isLoading, mutate } = useMutation<number, Error, string>(
    async (question) => {
      let res = await request("/api/decisionList/new", {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return await res.json();
    },
    {
      onSuccess: (id) => {
        navigate(`/list/edit/${id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <textarea
        style={{
          fontFamily: "'Dangrek', cursive",
          height: `${textAreaLines * LINE_HEIGHT + EXTRA_HEIGHT}px`,
          paddingTop: `${EXTRA_HEIGHT / 2 - 2}px`,
          paddingLeft: `${EXTRA_HEIGHT / 2 - 2}px`,
          paddingRight: `${EXTRA_HEIGHT / 2 - 2}px`,
          lineHeight: `${LINE_HEIGHT}px`,
        }}
        onChange={(e) => {
          let newNumberOfLines = getNumberOfLinesTextarea(
            e.target.scrollHeight
          );
          if (newNumberOfLines !== textAreaLines)
            setTextAreaLines(newNumberOfLines);
          setQuestion(e.target.value);
        }}
        value={question}
        placeholder="What do you want to decide?"
        className="mb-7 w-5/6 max-w-2xl border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none"
      />
      <button
        disabled={question.length === 0 || isLoading}
        style={{ fontFamily: "'Dangrek', cursive" }}
        className="h-10 w-5/6 max-w-2xl border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
        onClick={() => mutate(question)}
      >
        {isLoading ? (
          <Spinner className="-ml-1 mr-3 inline-block h-5 w-5 animate-spin text-black" />
        ) : null}
        Create
      </button>
      <div className="absolute bottom-0 w-full pb-10 text-center">
        <Link
          to="/lists"
          style={{ fontFamily: "'Dangrek', cursive" }}
          className="inline-flex h-10 w-5/6 max-w-lg items-center justify-center border-2 border-black shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
        >
          Create from existing list
        </Link>
      </div>
    </div>
  );
};
