import { createBrowserRouter } from "react-router-dom";
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


const router = createBrowserRouter([
  {
    path: "/",
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
  { path: "/builder-block-preview-main", 
    element: <BlockPreview />,
   },
   { path: "/add-templates", 
    element: <CreateTemplateAndSS />,
   },
   { path: "/edit-templates", 
    element: <EditTemplateList/>,
   },
   { path: "template/edit/:id",
     element: <CreateTemplateAndSS />,
  loader: async ({ params }) => {
    const { id } = params;
    const response = await fetch(`${import.meta.env.VITE_TO_SERVER_API_URL}/template/edit/${id}`);
    if (!response.ok) throw new Error("Template not found");
    return response.json();
    }
  },
   { path: "/templates", 
    element: <TemplateGallery/>,
   },
]);

export default router;
