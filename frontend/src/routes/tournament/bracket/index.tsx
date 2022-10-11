import { FC, useMemo } from "react";
import { useLoaderData } from "react-router-dom";
import { DecisionOption } from "../../decisionList/edit";
import { Match } from "../play";

export const TournamentBracket: FC = () => {
  const matches = useLoaderData() as Match[];
  const data = useMemo(() => processMatches(matches), [matches]);
  return (
    <table>
      <tbody>
        {data.map((row, rowIndex) => {
          return (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, colIndex) => {
                return (
                  <td
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`border-black${
                      cell.paintLeft ? " border-l-2" : ""
                    }${cell.isPresent ? " border-b-2" : ""}`}
                  >
                    <div
                      style={{
                        width: "240px",
                        height: "36px",
                      }}
                      className="flex items-end"
                    >
                      <span className="ml-2 block w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {cell.isPresent ? cell.name : null}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const getNumberOfColumns = (numberOfMatches: number): number => {
  return Math.floor(Math.log2(numberOfMatches)) + 2;
};

const getNumberOfRows = (numberOfColumns: number): number => {
  return Math.pow(2, numberOfColumns) - 1;
};

interface ICellValue {
  name: string;
  isPresent: boolean;
  paintLeft: boolean;
}

const generateEmptyMatrix = (rows: number, cols: number) => {
  let matrix = Array.apply(null, Array(rows)).map(() => {
    return Array.apply(null, Array(cols)).map(() => {
      let value: ICellValue = {
        name: "",
        isPresent: false,
        paintLeft: false,
      };
      return value;
    });
  });
  return matrix;
};

const getMatchColumn = (matchIndex: number, numberOfColums: number) => {
  return numberOfColums - Math.floor(Math.log2(matchIndex)) - 2;
};

const getMatchOption1Row = (
  columnIndex: number,
  singleSpacing: number,
  numberEmptyTop: number
) => {
  return numberEmptyTop + 2 * singleSpacing * columnIndex;
};
const getMatchOption2Row = (
  columnIndex: number,
  singleSpacing: number,
  numberEmptyTop: number
) => {
  return numberEmptyTop + 2 * singleSpacing * columnIndex + singleSpacing;
};

const getNumberEmptyTop = (column: number) => {
  return Math.floor(Math.pow(2, column)) - 1;
};

const getColumnsEmptyTop = (numberOfColumns: number) => {
  let array = generateArray(numberOfColumns);
  for (let i = 0; i < array.length; i++) {
    array[i] = getNumberEmptyTop(i);
  }
  return array;
};

const getSingleSpacing = (column: number) => {
  return Math.pow(2, column + 1);
};

const getColumnsSingleSpacing = (numberOfColumns: number) => {
  let array = generateArray(numberOfColumns);
  for (let i = 0; i < array.length; i++) {
    array[i] = getSingleSpacing(i);
  }
  return array;
};

const getMatchColumnIndexArray = (numberOfMatches: number) => {
  let array = generateArray(numberOfMatches + 1);
  array[0] = -1;
  array[1] = 0;
  let currentIndex = 2;
  for (let arrayIndex = 2; arrayIndex < array.length; currentIndex *= 2) {
    for (
      let index = 0;
      index < currentIndex && arrayIndex < array.length;
      index++, arrayIndex++
    ) {
      array[arrayIndex] = index;
    }
  }
  return array;
};

const generateArray = (length: number) => {
  return Array.apply(null, Array(length)).map(() => -1);
};

const insertOption = (
  option: DecisionOption | null,
  row: number,
  col: number,
  is1: boolean,
  spacing: number,
  matrix: ICellValue[][]
) => {
  matrix[row][col].isPresent = true;
  if (option !== null) matrix[row][col].name = option.name;
  if (is1) {
    for (let i = row + 1; i <= row + spacing; i++) {
      matrix[i][col + 1].paintLeft = true;
    }
  }
};

const processMatches = (matches: Match[]) => {
  let numberOfColums = getNumberOfColumns(matches.length);
  let numberOfRows = getNumberOfRows(numberOfColums);
  let singleSpacingArr = getColumnsSingleSpacing(numberOfColums);
  let emptyTopArr = getColumnsEmptyTop(numberOfColums);
  let matchColumnIndexes = getMatchColumnIndexArray(matches.length);
  let data = generateEmptyMatrix(numberOfRows, numberOfColums);
  for (let match of matches) {
    let matchColumn = getMatchColumn(match.matchIndex, numberOfColums);
    let singleSpacing = singleSpacingArr[matchColumn];
    let emtpyTop = emptyTopArr[matchColumn];
    let columnIndex = matchColumnIndexes[match.matchIndex];
    let option1Row = getMatchOption1Row(columnIndex, singleSpacing, emtpyTop);
    let option2Row = getMatchOption2Row(columnIndex, singleSpacing, emtpyTop);
    insertOption(
      match.option1,
      option1Row,
      matchColumn,
      true,
      singleSpacing,
      data
    );
    insertOption(
      match.option2,
      option2Row,
      matchColumn,
      false,
      singleSpacing,
      data
    );
    if (match.matchIndex === 1) {
      let winnerRow = getMatchOption1Row(
        0,
        singleSpacingArr[matchColumn + 1],
        emptyTopArr[matchColumn + 1]
      );
      insertOption(
        match.winner,
        winnerRow,
        matchColumn + 1,
        false,
        singleSpacingArr[matchColumn + 1],
        data
      );
    }
  }
  return data;
};
