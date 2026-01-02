import { useEffect, useState } from "react";
import { useConnectionStore } from "@/stores/connectionStore";
import { useRedisStore } from "@/stores/redisStore";
import { ConnectionFormDialog } from "@/components/connection/ConnectionFormDialog";
import { ConnectionSidebar } from "@/components/connection/ConnectionSidebar";
import { GroupFormDialog } from "@/components/connection/GroupFormDialog";
import { KeyBrowser } from "@/components/redis/KeyBrowser";
import { ValueEditor } from "@/components/redis/ValueEditor";
import { SettingsDialog } from "@/components/SettingsDialog";
import { NavBar } from "@/components/NavBar";
import { StatusBar } from "@/components/StatusBar";
import { Toaster } from "@/components/ui/toaster";
import { Connection, ConnectionGroup } from "@/types";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

function App() {
  const { connections, fetchConnections, fetchGroups, deleteConnection, groups } =
    useConnectionStore();
  const { connectedId, selectDatabase, currentDatabase } = useRedisStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preselectedGroupId, setPreselectedGroupId] = useState<string | undefined>(undefined);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<
    Connection | undefined
  >(undefined);
  const [editingGroup, setEditingGroup] = useState<
    ConnectionGroup | undefined
  >(undefined);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(
    null
  );

  // Get currently connected connection
  const connectedConnection = connections.find((c) => c.id === connectedId) || null;

  useEffect(() => {
    fetchConnections();
    fetchGroups();
  }, [fetchConnections, fetchGroups]);

  // Auto-select connected connection or first connection
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

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingConnection(undefined);
      setPreselectedGroupId(undefined);
    }
  };

  const handleGroupDialogClose = (open: boolean) => {
    setGroupDialogOpen(open);
    if (!open) {
      setEditingGroup(undefined);
    }
  };

  const handleEditGroup = (group: ConnectionGroup) => {
    setEditingGroup(group);
    setGroupDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Navigation Bar */}
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          {/* Left - Connection Sidebar */}
          <ResizablePanel defaultSize={20} minSize={10}>
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
              onEditGroup={handleEditGroup}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Middle - Key Browser */}
          <ResizablePanel defaultSize={25} minSize={10}>
            <KeyBrowser />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right - Value Editor */}
          <ResizablePanel defaultSize={55} minSize={30}>
            <ValueEditor />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar
        currentConnection={connectedConnection}
        currentDatabase={currentDatabase}
        isConnected={!!connectedId}
      />

      {/* Dialogs */}
      <ConnectionFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        connection={editingConnection}
        preselectedGroupId={preselectedGroupId}
      />
      <GroupFormDialog
        open={groupDialogOpen}
        onOpenChange={handleGroupDialogClose}
        group={editingGroup}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default App;
