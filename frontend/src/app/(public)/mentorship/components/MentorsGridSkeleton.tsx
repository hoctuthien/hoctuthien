import React from "react";
import { Skeleton } from "@/core/ui";

export const MentorsGridSkeleton = () => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-[24px] p-7 shadow-[0_12px_30px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-[312px]"
          >
            <div>
              {/* Header: Avatar + Name/Title placeholders */}
              <div className="flex items-center gap-4 mb-5">
                <Skeleton variant="rectangular" className="w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-5 w-3/4" />
                  <Skeleton variant="text" className="h-4 w-1/2" />
                </div>
              </div>

              {/* Bio description placeholder */}
              <div className="space-y-2 mb-7">
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-4 w-5/6" />
                <Skeleton variant="text" className="h-4 w-2/3" />
              </div>
            </div>

            {/* Buttons placeholder */}
            <div className="flex gap-3">
              <Skeleton variant="rectangular" className="flex-1 h-10 rounded-lg" />
              <Skeleton variant="rectangular" className="flex-1 h-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
