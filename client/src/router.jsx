import { createBrowserRouter } from "react-router-dom";

// 1. Import your new RootLayout component
import RootLayout from "./pages/RootLayout"; 

import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/DashboardPage";
import TemplatePreviewPage from "./pages/TemplatePreviewPage";
import FrameBuilder from "./pages/FrameBuilderPage";
import BuildBlocks from "./components/BuildBlocks/BuildBlocks";
import IntermediateComponent from "./components/BuildBlocks/intermediateComponent";
import BlockPreview from "./components/BuildBlocks/BlockPreview";
import CreateTemplateAndSS from "./components/CreateTemplateAndSS";
import EditTemplateList from "./components/EditTemplateList";
import EditTemplateForm from "./components/EditTemplateForm";
import TemplateGallery from "./components/TemplateGallery";
import ChatBot from "./components/Chatbot";
import ChatBoardLayout from "./components/ChatBoardLayout";

const router = createBrowserRouter([
  {
    // 2. Define the RootLayout as the parent route for everything.
    path: "/",
    element: <RootLayout />,
    // 3. Move all your original routes into a 'children' array.
    children: [
      {
        // The path for WelcomePage is now an 'index' route,
        // meaning it renders when the path is exactly "/".
        index: true, 
        element: <WelcomePage />,
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/preview-main",
        element: <TemplatePreviewPage />,
      },
      {
        path: "/frame-builder",
        element: <FrameBuilder />,
      },
      {
        path: "/build-blocks-main",
        element: <BuildBlocks />,
      },
      {
        path: "/intermediate-component",
        element: <IntermediateComponent />,
      },
      {
        path: "/builder-block-preview-main",
        element: <BlockPreview />,
      },
      {
        path: "/add-templates",
        element: <CreateTemplateAndSS />,
      },
      {
        path: "/edit-templates",
        element: <EditTemplateList />,
      },
      {
        path: "template/edit/:id",
        element: <CreateTemplateAndSS />,
        loader: async ({ params }) => {
          const { id } = params;
          const response = await fetch(
            `${import.meta.env.VITE_TO_SERVER_API_URL}/template/edit/${id}`
          );
          if (!response.ok) throw new Error("Template not found");
          return response.json();
        },
      },
      {
        path: "/templates",
        element: <TemplateGallery />,
      },
    ],
  },
]);

export default router;