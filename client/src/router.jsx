import { createBrowserRouter } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TemplatePreviewPage from "./pages/TemplatePreviewPage";
import FrameBuilder from "./pages/FrameBuilderPage";


const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardPage />,
  },
  {
    path: "/preview",
    element: <TemplatePreviewPage />,
  },
  {
    path: "/frame-builder",
    element: <FrameBuilder />
  },
]);

export default router;
