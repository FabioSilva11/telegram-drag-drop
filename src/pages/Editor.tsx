import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowProvider, useFlow } from '@/contexts/FlowContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { NodesSidebar } from '@/components/flow/NodesSidebar';
import { FlowCanvas } from '@/components/flow/FlowCanvas';
import { FlowToolbar } from '@/components/flow/FlowToolbar';
import { NodeEditorPanel } from '@/components/flow/NodeEditorPanel';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Platform } from '@/types/flow';

function EditorInner({ botId, platform }: { botId: string; platform: Platform }) {
  const { nodes, edges, setNodes, setEdges } = useFlow();
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load flow from database on mount
  useEffect(() => {
    const loadFlow = async () => {
      const { data, error } = await supabase
        .from('bot_flows')
        .select('nodes, edges')
        .eq('bot_id', botId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data && data.nodes && data.edges) {
        const loadedNodes = data.nodes as any[];
        const loadedEdges = data.edges as any[];
        if (loadedNodes.length > 0) {
          setNodes(loadedNodes);
          setEdges(loadedEdges);
        }
      }
      setLoaded(true);
    };
    loadFlow();
  }, [botId]);

  // Auto-save flow to database when nodes/edges change (debounced)
  useEffect(() => {
    if (!loaded) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        // Check if a flow record exists for this bot
        const { data: existing } = await supabase
          .from('bot_flows')
          .select('id')
          .eq('bot_id', botId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('bot_flows')
            .update({ nodes: nodes as any, edges: edges as any, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          // Get bot info
          const { data: bot } = await supabase
            .from('bots')
            .select('name, user_id, platform')
            .eq('id', botId)
            .maybeSingle();

          if (bot) {
            await supabase.from('bot_flows').insert({
              bot_id: botId,
              bot_name: bot.name,
              user_id: bot.user_id,
              platform: bot.platform,
              nodes: nodes as any,
              edges: edges as any,
            });
          }
        }
      } catch (err) {
        console.error('Auto-save error:', err);
      } finally {
        setSaving(false);
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [nodes, edges, loaded, botId]);

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Carregando fluxo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <NodesSidebar platform={platform} />
      <div className="flex flex-1 flex-col">
        <FlowToolbar botId={botId} platform={platform} saving={saving} />
        <div className="relative flex-1">
          <FlowCanvas />
          <NodeEditorPanel />
        </div>
      </div>
    </div>
  );
}



export default function Editor() {
  const { botId } = useParams<{ botId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        <EditorInner botId={botId} platform={platform} />
      </FlowProvider>
    </ReactFlowProvider>
  );
}
