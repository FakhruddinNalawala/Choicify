import { FC } from "react";
import { PageTitleBar } from "../../components/PageTitleBar";
import { BsListStars } from "react-icons/bs";

export const Lists: FC = () => {
  return (
    <div className="w-full">
      <PageTitleBar title="Lists" icon={<BsListStars />} />
    </div>

  );
};