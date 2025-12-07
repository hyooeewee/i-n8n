import { PAGINATION } from "@/config/constants";
import { useEffect, useState } from "react";

interface UseEntitySearchProps<
  T extends {
    search: string;
    page: number;
  }
> {
  params: T;
  setParams: (params: T) => void;
  debounceMs?: number;
}

export const useEntitySearch = <T extends { search: string; page: number }>({
  params,
  setParams,
  debounceMs = 500,
}: UseEntitySearchProps<T>) => {
  const [localSearch, setLocalSearch] = useState(params.search);
  useEffect(() => {
    // Empty search input
    if (localSearch === "" && params.search !== "") {
      return setParams({
        ...params,
        search: "",
        page: PAGINATION.DEFAULT_PAGE,
      });
    }
    const timer = setTimeout(() => {
      // Search input changed
      if (localSearch !== params.search) {
        setParams({
          ...params,
          search: localSearch,
          page: PAGINATION.DEFAULT_PAGE,
        });
      }
    }, debounceMs);
    // Cleanup timer to prevent memory leak
    return () => clearTimeout(timer);
  }, [localSearch, params, setParams, debounceMs]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync params.search changes to input field
    setLocalSearch(params.search);
  }, [params.search]);
  return {
    searchValue: localSearch,
    onSearchChange: setLocalSearch,
  };
};
