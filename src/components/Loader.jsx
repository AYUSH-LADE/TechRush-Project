import React from 'react';

export const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <div className="relative flex items-center justify-center w-12 h-12 mb-4">
        <div className="absolute w-12 h-12 rounded-full border-4 border-blue-100 animate-ping"></div>
        <div className="w-10 h-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-600 tracking-wide">{label}</p>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-pulse">
      <div className="h-48 bg-slate-200 w-full"></div>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded-full w-20"></div>
          <div className="h-5 bg-slate-200 rounded-full w-16"></div>
        </div>
        <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
          <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
