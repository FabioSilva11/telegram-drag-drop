import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowProvider } from '@/contexts/FlowContext';
import { useAuth } from '@/contexts/AuthContext';
import { NodesSidebar } from '@/components/flow/NodesSidebar';
import { FlowCanvas } from '@/components/flow/FlowCanvas';
import { FlowToolbar } from '@/components/flow/FlowToolbar';
import { NodeEditorPanel } from '@/components/flow/NodeEditorPanel';
import type { Platform } from '@/types/flow';

export default function Editor() {
  const { botId } = useParams<{ botId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract platform from URL path
  const pathParts = location.pathname.split('/');
  const platformFromUrl = pathParts[2] as Platform;
  const platform: Platform = ['telegram', 'whatsapp', 'discord'].includes(platformFromUrl) ? platformFromUrl : 'telegram';

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  if (loading || !user || !botId) return null;

  return (
    <ReactFlowProvider>
      <FlowProvider botId={botId}>
        <div className="flex h-screen w-screen overflow-hidden bg-background">
          <NodesSidebar platform={platform} />
          <div className="flex flex-1 flex-col">
            <FlowToolbar botId={botId} platform={platform} />
            <div className="relative flex-1">
              <FlowCanvas />
              <NodeEditorPanel />
            </div>
          </div>
        </div>
      </FlowProvider>
    </ReactFlowProvider>
  );
}
