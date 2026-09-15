import React from "react";

export default function PageContainer({ children }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      {children}
    </div>
  );
}
