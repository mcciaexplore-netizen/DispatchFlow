import { useState } from "react";

/**
 * Generic search + date-range filter hook.
 * Shared between HistoryList (dispatch slips) and InvoiceHistoryPage.
 *
 * @param {Array}    items   - Full array of records to filter.
 * @param {Function} matchFn - (item, lowerCaseQuery) => boolean
 *                             Return true if the item matches the search query.
 * @returns {object} - { search, setSearch, dateFrom, setDateFrom, dateTo, setDateTo, filtered, clear }
 */
export function useSearchFilter(items, matchFn) {
  const [search,   setSearch  ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo  ] = useState("");

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !q || matchFn(item, q);

    const itemDate = new Date(item.createdAt).toISOString().slice(0, 10);
    const matchFrom = !dateFrom || itemDate >= dateFrom;
    const matchTo   = !dateTo   || itemDate <= dateTo;

    return matchSearch && matchFrom && matchTo;
  });

  const clear = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  return { search, setSearch, dateFrom, setDateFrom, dateTo, setDateTo, filtered, clear };
}
