import React, { useEffect, useMemo, useState } from "react";
import EmptyState from "./EmptyState.jsx";
import Pagination from "./Pagination.jsx";

export default function DataTable({
  columns = [],
  rows = [],
  emptyText = "No data.",
  paginated = false,
  pageSize = 10,
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeRows = Array.isArray(rows) ? rows : [];

  const [page, setPage] = useState(1);

  const total = safeRows.length;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [pageSize, total],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [pageSize, safeRows]);

  useEffect(() => {
    if (page > totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleRows = useMemo(() => {
    if (!paginated) return safeRows;

    const startIndex = (page - 1) * pageSize;
    return safeRows.slice(startIndex, startIndex + pageSize);
  }, [page, pageSize, paginated, safeRows]);

  if (safeRows.length === 0) return <EmptyState title={emptyText} />;

  // Mobile: card list
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {visibleRows.map((r) => (
          <div
            key={r.id || JSON.stringify(r)}
            className="rounded-2xl border bg-white p-4"
          >
            {columns
              .filter((c) => c.key !== "actions")
              .slice(0, 5)
              .map((c) => (
                <div
                  key={c.key}
                  className="flex items-start justify-between gap-3 py-1"
                >
                  <p className="text-xs font-medium text-slate-500">
                    {c.header}
                  </p>
                  <div className="text-sm text-slate-900 text-right">
                    {c.render ? c.render(r) : String(r[c.key] ?? "-")}
                  </div>
                </div>
              ))}
            {columns.find((c) => c.key === "actions") ? (
              <div className="mt-3 flex items-center justify-end gap-2">
                {columns.find((c) => c.key === "actions").render(r)}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block">
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed border-separate border-spacing-0">
            <thead>
              <tr className="text-left">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={
                      "border-b bg-white px-4 py-3 text-xs font-semibold wrap-break-word whitespace-normal text-slate-600 " +
                      (c.key === "actions" ? "text-right w-36" : "text-left")
                    }
                    style={c.width ? { width: c.width } : undefined}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r, idx) => (
                <tr key={r.id || idx} className="hover:bg-slate-50">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={
                        "border-b px-4 py-3 align-top text-sm wrap-break-word whitespace-normal text-slate-900 " +
                        (c.key === "actions" ? "text-right" : "text-left")
                      }
                      style={c.width ? { width: c.width } : undefined}
                    >
                      {c.key === "actions" ? (
                        <div className="flex items-center justify-end gap-2">
                          {c.render ? c.render(r) : String(r[c.key] ?? "-")}
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <div className="wrap-break-word whitespace-normal">
                            {c.render ? c.render(r) : String(r[c.key] ?? "-")}
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {paginated ? (
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
          />
        </div>
      ) : null}
    </>
  );
}
