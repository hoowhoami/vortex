import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useConnectionStore } from "@/stores/connectionStore";
import { useRedisStore } from "@/stores/redisStore";
import { ConnectionFormDialog } from "@/components/connection/ConnectionFormDialog";
import { ConnectionSidebar } from "@/components/connection/ConnectionSidebar";
import { GroupFormDialog } from "@/components/connection/GroupFormDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { NavBar } from "@/components/NavBar";
import { StatusBar } from "@/components/StatusBar";
import { Toaster } from "@/components/ui/toaster";
import { Connection, ConnectionGroup } from "@/types";
import { KeyBrowser } from "@/components/redis/KeyBrowser";
import { ValueEditor } from "@/components/redis/ValueEditor";
import { RedisConsole } from "@/components/redis/RedisConsole";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

function App() {
  const { connections, fetchConnections, fetchGroups, deleteConnection, groups } = useConnectionStore();
  const { connectedId, selectDatabase, currentDatabase } = useRedisStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preselectedGroupId, setPreselectedGroupId] = useState<string | undefined>(undefined);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | undefined>(undefined);
  const [editingGroup, setEditingGroup] = useState<ConnectionGroup | undefined>(undefined);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  const connectedConnection = connections.find((c) => c.id === connectedId) || null;

  useEffect(() => {
    fetchConnections();
    fetchGroups();
  }, [fetchConnections, fetchGroups]);

  useEffect(() => {
    if (connections.length > 0 && !selectedConnection) {
      const connectedConn = connections.find((c) => c.id === connectedId);
      setSelectedConnection(connectedConn || connections[0]);
    }
  }, [connections, connectedId, selectedConnection]);

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteConnection(id);
    if (selectedConnection?.id === id) {
      setSelectedConnection(connections[0] || null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <NavBar
        currentConnection={connectedConnection}
        currentDatabase={currentDatabase}
        onSettings={() => setSettingsOpen(true)}
        groups={groups}
        onDatabaseSwitch={async (db) => {
          try {
            await selectDatabase(db);
          } catch (error) {
            console.error("Failed to switch database:", error);
          }
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-full h-full">
          <div className="w-64 border-r shrink-0">
            <ConnectionSidebar
              onAddConnection={(groupId) => {
                setPreselectedGroupId(groupId);
                setDialogOpen(true);
              }}
              onEditConnection={handleEdit}
              onDeleteConnection={handleDelete}
              onSelectConnection={setSelectedConnection}
              selectedConnection={selectedConnection}
              onAddGroup={() => setGroupDialogOpen(true)}
              onEditGroup={(group) => {
                setEditingGroup(group);
                setGroupDialogOpen(true);
              }}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/browser" replace />} />
              <Route
                path="/browser"
                element={
                  <ResizablePanelGroup orientation="horizontal" className="w-full h-full">
                    <ResizablePanel defaultSize={33} minSize={20}>
                      <KeyBrowser />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={67} minSize={20}>
                      <ValueEditor />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                }
              />
              <Route path="/console" element={<RedisConsole />} />
            </Routes>
          </div>
        </div>
      </div>

      <StatusBar
        currentConnection={connectedConnection}
        currentDatabase={currentDatabase}
        isConnected={!!connectedId}
      />

      <ConnectionFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingConnection(undefined);
            setPreselectedGroupId(undefined);
          }
        }}
        connection={editingConnection}
        preselectedGroupId={preselectedGroupId}
      />
      <GroupFormDialog
        open={groupDialogOpen}
        onOpenChange={(open) => {
          setGroupDialogOpen(open);
          if (!open) setEditingGroup(undefined);
        }}
        group={editingGroup}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Toaster />
    </div>
  );
}

export default App;
