import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axios, { Method } from "axios";
import { apiUrl } from "../constants";

const useQueryMutation = <TData = unknown, TVariables = unknown>(
  url: string,
  method: Method,
  options?: Omit<UseMutationOptions<TData, unknown, TVariables>, "mutationFn">,
) =>
  useMutation({
    retry: false,
    networkMode: "always",
    gcTime: 1000 * 60 * 60 * 24 * 24,
    mutationFn: (data?: TVariables): Promise<TData> =>
      axios
        .create({
          baseURL: apiUrl,
          method,
        })
        .request({
          url,
          data,
        })
        .then((res) => res.data.data),
    ...options,
  });

export default useQueryMutation;
