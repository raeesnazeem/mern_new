import { createBrowserRouter } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TemplatePreviewPage from "./pages/TemplatePreviewPage";
import FrameBuilder from "./pages/FrameBuilderPage";
import BuildBlocks from "./components/BuildBlocks/BuildBlocks";
import IntermediateComponent from "./components/BuildBlocks/intermediateComponent";


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
  {
    path: "/build-blocks",
    element: <BuildBlocks />
  },
  {
    path: "/intermediate-component",
    element: <IntermediateComponent />
  },

]);

export default router;
