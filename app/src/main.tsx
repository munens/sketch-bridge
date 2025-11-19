import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Start } from "./pages/start";
import { Canvas } from "./pages/canvas";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Start />,
  },
  {
    path: "/canvas",
    element: <Canvas />,
  },
]);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
