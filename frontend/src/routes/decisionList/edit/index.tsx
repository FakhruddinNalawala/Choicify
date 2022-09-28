import { FC } from "react"
import { useLoaderData } from "react-router-dom"

export const EditDecisionList: FC = () => {
  const data = useLoaderData();
  console.log(data);
  return <div>Edit decision list</div>
}