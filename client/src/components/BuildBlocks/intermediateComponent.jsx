import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

// Draggable section item component
const SectionItem = ({ section, index, onDragStart, onDragOver, onDrop }) => {
  // const getSectionColor = (sectionType) => {
  //   const colors = {
  //     'cta': '#FF6B6B',
  //     'header': '#4ECDC4',
  //     'hero': '#45B7D1',
  //     'footer': '#96CEB4',
  //     'about': '#FFEAA7',
  //     'services': '#DDA0DD',
  //     'contact': '#98D8C8',
  //     'gallery': '#FFB6C1'
  //   };
  //   return colors[sectionType] || '#E0E0E0';
  // };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      style={{
        padding: "12px 16px",
        margin: "4px 0",
        // backgroundColor: getSectionColor(section.sectionType),
        border: "1px solid #ddd",
        borderRadius: "6px",
        cursor: "move",
        // boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: "all 0.2s ease",
      }}
      // onMouseEnter={(e) => {
      //   e.target.style.transform = 'translateX(4px)';
      //   e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      // }}
      // onMouseLeave={(e) => {
      //   e.target.style.transform = 'translateX(0)';
      //   e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      // }}
    >
      <div style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>
        {section.name}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "#666",
          textTransform: "uppercase",
          marginTop: "2px",
        }}
      >
        {section.sectionType}
      </div>
      <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>
        Tags: {section.tags?.join(", ") || "None"}
      </div>
    </div>
  );
};

// Custom node component with draggable sections
const TemplateNode = ({ data }) => {
  const [sections, setSections] = useState(data.sections || []);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    // if (draggedIndex === null || draggedIndex === dropIndex) return;

    // const newSections = [...sections];
    // const draggedSection = newSections[draggedIndex];

    // // Remove dragged item
    // newSections.splice(draggedIndex, 1);

    // // Insert at new position
    // const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    // newSections.splice(insertIndex, 0, draggedSection);

    // setSections(newSections);
    // setDraggedIndex(null);
  };

  return (
    <div
      style={{
        minWidth: "350px",
        maxWidth: "400px",
        background: "#fff",
        border: "2px solid #333",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          fontSize: "18px",
          marginBottom: "12px",
          textAlign: "center",
          color: "#333",
          borderBottom: "2px solid #eee",
          paddingBottom: "8px",
        }}
      >
        {data.label}
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#666",
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        {sections.length} Section{sections.length !== 1 ? "s" : ""}
      </div>

      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {sections.map((section, index) => (
          <SectionItem
            key={`${section._id}-${index}`}
            section={section}
            index={index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {sections.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#999",
            fontStyle: "italic",
            padding: "20px",
          }}
        >
          No sections available
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  template: TemplateNode,
};

const IntermediateComponent = () => {
  const location = useLocation();
  const [templatesOrderedBySection, setTemplatesOrderedBySection] = useState(
    []
  );
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Get templates from route state or use mock data
    const mockData = [
      [
        {
          _id: "6826bee0d89a762a0257da06",
          name: "CTA SM Aesthetics",
          sectionType: "cta",
          tags: ["cream", "elegant", "light"],
        },
      ],
      [
        {
          _id: "6826bee0d89a762a0257da07",
          name: "Hero Beauty Salon",
          sectionType: "hero",
          tags: ["modern", "beauty", "professional"],
        },
        {
          _id: "6826bee0d89a762a0257da08",
          name: "Services Overview",
          sectionType: "services",
          tags: ["comprehensive", "detailed"],
        },
      ],
    ];

    const templates = location.state?.templatesOrderedBySection || mockData;
    setTemplatesOrderedBySection(templates);

    console.log("Templates in order: ", templates);

    // Create a single node containing all sections from all template object arrays
    const allSections = Object.values(templates).flat();

    if (allSections.length > 0) {
      const templateNode = {
        id: "template-sections",
        type: "template",
        data: {
          label: "Template Sections",
          sections: allSections,
        },
        position: { x: 250, y: 100 },
      };

      setNodes([templateNode]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  // const onConnect = useCallback(
  //   (params) => setEdges((eds) => addEdge(params, eds)),
  //   [setEdges]
  // );

  return (
    <div style={{ width: "100%", height: "800px", border: "0px solid #ddd" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          // onEdgesChange={onEdgesChange}
          // onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          {/* <MiniMap 
            nodeColor="#f0f0f0"
            nodeStrokeWidth={3}
            zoomable
            pannable
          /> */}
          <Background variant="dots" gap={15} size={2} color="#ccc" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default IntermediateComponent;
