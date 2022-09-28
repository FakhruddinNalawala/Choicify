import { FC, useState } from "react";

const LINE_HEIGHT = 20;
const EXTRA_HEIGHT = 24;
const getNumberOfLinesTextarea = (scrollHeight: number): number => {
  return Math.ceil((scrollHeight - EXTRA_HEIGHT) / LINE_HEIGHT);
};

export const NewTournament: FC = () => {
  const [textAreaLines, setTextAreaLines] = useState(1);
  const [question, setQuestion] = useState("");

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
        disabled={question.length === 0}
        style={{ fontFamily: "'Dangrek', cursive" }}
        className="h-10 w-5/6 max-w-2xl border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
      >
        Create
      </button>
      <div className="absolute bottom-0 w-full pb-10 text-center">
        <button
          style={{ fontFamily: "'Dangrek', cursive" }}
          className="h-10 w-5/6 max-w-lg border-2 border-black text-center shadow-md hover:shadow-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
        >
          Create from existing list
        </button>
      </div>
    </div>
  );
};
