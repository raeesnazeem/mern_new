import { createBrowserRouter } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage"; // Path to your SIMPLIFIED DashboardPage.jsx
import TemplatePreviewPage from "./pages/TemplatePreviewPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardPage />,
  },
  {
    path: "/preview",
    element: <TemplatePreviewPage />,
  },
]);

export default router;
