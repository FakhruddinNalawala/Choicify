import {FC} from "react";

interface PageTitleBarProps {
    title: string;
    icon: JSX.Element;
}

export const PageTitleBar: FC<PageTitleBarProps> = ({ title, icon }) => {
    return (
        <div className="fixed top-0 flex justify-center w-full">
            <div className="max-w-4xl w-full text-center text-3xl pt-2 p-4 z-20 rounded-b-2xl bg-white shadow-[0_0_7px_2px_rgba(0,0,0,0.1)] shadow-gray-400">
                <span className="float-left inline-block flex mt-1">{icon}</span>
                <h2 className="inline-block text-center">{title}</h2>
            </div>
        </div>
    );
}
 