import React, { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import EmptyState from "./EmptyState.jsx";
import Pagination from "./Pagination.jsx";

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export default function SortableAnalyticsTable({
  columns = [],
  rows = [],
  emptyText = "No data found.",
  tableKey = "table",
  defaultSort,
  scrollable = false,
  mobileCards = false,
  paginated = false,
  pageSize = 10,
}) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const firstSortableColumn = columns.find(
    (column) => column.sortable !== false,
  );
  const initialSort = useMemo(
    () =>
      defaultSort || {
        key: firstSortableColumn?.key,
        direction: "desc",
      },
    [defaultSort, firstSortableColumn?.key],
  );

  const [sortState, setSortState] = useState(initialSort);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSortState(defaultSort || initialSort);
  }, [defaultSort, initialSort, tableKey]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, safeRows, tableKey]);

  const sortedRows = useMemo(() => {
    if (!sortState?.key) return safeRows;

    const column = columns.find((item) => item.key === sortState.key);
    if (!column) return safeRows;

    const directionFactor = sortState.direction === "asc" ? 1 : -1;

    return [...safeRows].sort((left, right) => {
      const leftValue = column.sortValue
        ? column.sortValue(left)
        : left[column.key];
      const rightValue = column.sortValue
        ? column.sortValue(right)
        : right[column.key];

      return compareValues(leftValue, rightValue) * directionFactor;
    });
  }, [columns, safeRows, sortState]);

  const sortableColumns = useMemo(
    () => columns.filter((column) => column.sortable !== false),
    [columns],
  );

  function toggleSort(key) {
    setSortState((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "desc" };
      }

      return {
        key,
        direction: current.direction === "desc" ? "asc" : "desc",
      };
    });
  }

  const total = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleRows = useMemo(() => {
    if (!paginated) return sortedRows;

    const startIndex = (page - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [page, pageSize, paginated, sortedRows]);

  if (safeRows.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  function renderCell(column, row) {
    return column.render ? column.render(row) : String(row[column.key] ?? "-");
  }

  function getColumnStyle(column) {
    if (scrollable) {
      return {
        width: column.width,
        minWidth: column.minWidth,
      };
    }

    return column.width ? { width: column.width } : undefined;
  }

  return (
    <>
      {mobileCards ? (
        <div className="space-y-3 sm:hidden">
          <div className="rounded-2xl border bg-white p-3">
            <div className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-medium text-neutral-500">
                  Sort by
                </span>
                <select
                  value={sortState?.key || sortableColumns[0]?.key || ""}
                  onChange={(event) =>
                    toggleSort(
                      event.target.value || sortableColumns[0]?.key || "",
                    )
                  }
                  className="rounded-xl border bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-brand"
                >
                  {sortableColumns.map((column) => (
                    <option key={column.key} value={column.key}>
                      {column.header}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() =>
                  sortState?.key
                    ? toggleSort(sortState.key)
                    : toggleSort(sortableColumns[0]?.key)
                }
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium text-neutral-700"
              >
                {sortState?.direction === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </div>

          {visibleRows.map((row, index) => {
            const primaryColumn = columns[0];
            const secondaryColumns = columns.slice(1);

            return (
              <div
                key={row.id || `${tableKey}_mobile_${index}`}
                className="rounded-2xl border bg-white p-4"
              >
                {primaryColumn ? (
                  <div className="border-b pb-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      {primaryColumn.header}
                    </p>
                    <div className="mt-1 text-sm font-semibold text-neutral-900">
                      {renderCell(primaryColumn, row)}
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 space-y-2">
                  {secondaryColumns.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-start justify-between gap-3"
                    >
                      <p className="min-w-0 text-xs font-medium text-neutral-500">
                        {column.header}
                      </p>
                      <div className="min-w-0 text-right text-sm text-neutral-900">
                        {renderCell(column, row)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        className={
          mobileCards
            ? scrollable
              ? "hidden w-full overflow-x-auto sm:block"
              : "hidden w-full overflow-hidden sm:block"
            : scrollable
              ? "w-full overflow-x-auto"
              : "w-full overflow-hidden"
        }
      >
        <table
          className={
            scrollable
              ? "min-w-max table-auto border-separate border-spacing-0"
              : "w-full table-fixed border-separate border-spacing-0"
          }
        >
          <thead>
            <tr className="text-left">
              {columns.map((column) => {
                const isSorted = sortState?.key === column.key;
                const alignClass =
                  column.align === "right" ? "text-right" : "text-left";

                return (
                  <th
                    key={column.key}
                    className={`border-b bg-white px-4 py-3 text-xs font-semibold text-neutral-600 ${alignClass}`}
                    style={getColumnStyle(column)}
                  >
                    {column.sortable === false ? (
                      column.header
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={`flex w-full items-center gap-1 whitespace-normal break-words ${column.align === "right" ? "justify-end text-right" : "justify-start text-left"}`}
                      >
                        <span>{column.header}</span>
                        {isSorted ? (
                          sortState.direction === "asc" ? (
                            <FiChevronUp className="h-4 w-4" />
                          ) : (
                            <FiChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <FiChevronDown className="h-4 w-4 text-neutral-300" />
                        )}
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row, index) => (
              <tr
                key={row.id || `${tableKey}_${index}`}
                className="hover:bg-neutral-50"
              >
                {columns.map((column) => {
                  const alignClass =
                    column.align === "right" ? "text-right" : "text-left";

                  return (
                    <td
                      key={column.key}
                      className={`border-b px-4 py-3 align-top text-sm break-words whitespace-normal text-neutral-900 ${alignClass}`}
                      style={getColumnStyle(column)}
                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.key] ?? "-")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
