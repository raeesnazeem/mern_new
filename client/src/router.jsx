// import { createBrowserRouter } from "react-router-dom";
// import DashboardPage from "./pages/DashboardPage";
// import TemplatePreviewPage from "./pages/TemplatePreviewPage";
// import FrameBuilder from "./pages/FrameBuilderPage";
// import BuildBlocks from "./components/BuildBlocks/BuildBlocks";
// import IntermediateComponent from "./components/BuildBlocks/intermediateComponent";
// import BlockPreview from "./components/BuildBlocks/BlockPreview";
// import CreateTemplateAndSS from "./components/CreateTemplateAndSS";
// import EditTemplateList from "./components/EditTemplateList";
// import EditTemplateForm from "./components/EditTemplateForm";
// import TemplateGallery from "./components/TemplateGallery";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <DashboardPage />,
//   },
//   {
//     path: "/preview-main",
//     element: <TemplatePreviewPage />,
//   },
//   {
//     path: "/frame-builder",
//     element: <FrameBuilder />,
//   },
//   {
//     path: "/build-blocks-main",
//     element: <BuildBlocks />,
//   },
//   {
//     path: "/intermediate-component",
//     element: <IntermediateComponent />,
//   },
//   { path: "/builder-block-preview-main",
//     element: <BlockPreview />,
//    },
//    { path: "/add-templates",
//     element: <CreateTemplateAndSS />,
//    },
//    { path: "/edit-templates",
//     element: <EditTemplateList/>,
//    },
//    { path: "template/edit/:id",
//      element: <CreateTemplateAndSS />,
//   loader: async ({ params }) => {
//     const { id } = params;
//     const response = await fetch(`${import.meta.env.VITE_TO_SERVER_API_URL}/template/edit/${id}`);
//     if (!response.ok) throw new Error("Template not found");
//     return response.json();
//     }
//   },
//    { path: "/templates",
//     element: <TemplateGallery/>,
//    },
// ]);

// export default router;
import { createBrowserRouter } from "react-router-dom";

// 1. Import your new RootLayout component
import RootLayout from "./RootLayout";

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
  // 2. Create a parent route that uses RootLayout as its element
  {
    element: <RootLayout />,
    // 3. Move all of your existing routes into the 'children' array of this parent route
    children: [
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
      { path: "/builder-block-preview-main", element: <BlockPreview /> },
      { path: "/add-templates", element: <CreateTemplateAndSS /> },
      { path: "/edit-templates", element: <EditTemplateList /> },
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
      { path: "/templates", element: <TemplateGallery /> },
    ],
  },
]);

export default router;
