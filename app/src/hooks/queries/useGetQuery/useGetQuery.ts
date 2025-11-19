import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl } from "../constants";

const useGetQuery = <TData = unknown>(
  url: string,
  queryKey: string[],
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) =>
  useQuery<TData, Error>({
    retry: false,
    networkMode: "always",
    gcTime: 1000 * 60 * 60 * 24 * 24,
    enabled: false,
    queryKey,
    queryFn: async (): Promise<TData> => {
      const response = await axios.get(`${apiUrl}/${url}`);
      return response.data;
    },
    ...options,
  });

export default useGetQuery;
