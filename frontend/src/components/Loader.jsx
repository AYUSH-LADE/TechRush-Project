import React from 'react';

export const Loader = ({ label = 'Loading ledger entry...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-[#898989]">
      <div className="relative flex items-center justify-center w-12 h-12 mb-4 border border-[#898989] bg-[#F2F0EF]">
        <div className="w-6 h-6 border-2 border-[#4B6E48] border-t-transparent animate-spin"></div>
      </div>
      <p className="text-xs font-mono tracking-wider uppercase">{label}</p>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-[#F2F0EF] border border-[#898989] rounded-none overflow-hidden animate-pulse">
      <div className="h-48 bg-[#E5E2E0] w-full border-b border-[#898989]"></div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-[#E5E2E0] w-20"></div>
          <div className="h-4 bg-[#E5E2E0] w-16"></div>
        </div>
        <div className="h-5 bg-[#E5E2E0] w-3/4"></div>
        <div className="h-4 bg-[#E5E2E0] w-1/2"></div>
        <div className="pt-2.5 border-t border-dashed border-[#898989] flex justify-between items-center">
          <div className="h-4 bg-[#E5E2E0] w-1/3"></div>
          <div className="h-4 bg-[#E5E2E0] w-10"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
