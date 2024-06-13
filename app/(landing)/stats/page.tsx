import { TimePerProject } from "@/app/ui";
import React from "react";

const Page: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 w-full md:w-4/5 max-w-[1200px] gap-2">
      <TimePerProject />
    </div>
  );
};

export default Page;
