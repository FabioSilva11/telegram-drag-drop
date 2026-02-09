import { NodesSidebar } from '@/components/flow/NodesSidebar';
import { FlowCanvas } from '@/components/flow/FlowCanvas';
import { FlowToolbar } from '@/components/flow/FlowToolbar';
import { NodeEditorPanel } from '@/components/flow/NodeEditorPanel';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowProvider } from '@/contexts/FlowContext';

const Index = () => {
  return (
    <ReactFlowProvider>
      <FlowProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-background">
          <NodesSidebar />
          <div className="flex flex-1 flex-col">
            <FlowToolbar />
            <div className="relative flex-1">
              <FlowCanvas />
              <NodeEditorPanel />
            </div>
          </div>
        </div>
      </FlowProvider>
    </ReactFlowProvider>
  );
};

export default Index;
