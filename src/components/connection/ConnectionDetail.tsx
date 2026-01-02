import { Connection } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRedisStore } from "@/stores/redisStore";
import { Database, Edit, Trash2, Power } from "lucide-react";

interface ConnectionDetailProps {
  connection: Connection | null;
  onEdit: (connection: Connection) => void;
  onDelete: (id: string) => void;
  onConnect: (connection: Connection) => void;
}

export function ConnectionDetail({
  connection,
  onEdit,
  onDelete,
  onConnect,
}: ConnectionDetailProps) {
  const { connectedId } = useRedisStore();

  if (!connection) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Database className="mx-auto mb-4 text-muted-foreground" size={64} />
          <h3 className="text-lg font-semibold mb-2">No Connection Selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a connection from the sidebar to view details
          </p>
        </div>
      </div>
    );
  }

  const isConnected = connectedId === connection.id;

  return (
    <div className="p-6 h-full overflow-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${
                  isConnected ? "bg-green-100 dark:bg-green-900" : "bg-muted"
                }`}
              >
                <Database
                  className={
                    isConnected ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                  }
                  size={24}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{connection.name}</CardTitle>
                  {isConnected && (
                    <Badge className="bg-green-600">Connected</Badge>
                  )}
                </div>
                <CardDescription>
                  {connection.host}:{connection.port}
                </CardDescription>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(connection)}
              >
                <Edit size={14} className="mr-2" />
                Edit
              </Button>
              <Button
                variant={isConnected ? "destructive" : "default"}
                size="sm"
                onClick={() => onConnect(connection)}
              >
                <Power size={14} className="mr-2" />
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Connection Info */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Connection Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Host</label>
                <p className="text-sm font-mono">{connection.host}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Port</label>
                <p className="text-sm font-mono">{connection.port}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Database</label>
                <p className="text-sm font-mono">{connection.database}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">SSL</label>
                <p className="text-sm">{connection.ssl ? "Enabled" : "Disabled"}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Password</label>
                <p className="text-sm">{connection.password ? "••••••••" : "None"}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Created</label>
                <p className="text-sm">
                  {new Date(connection.createdAt * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {connection.tags && connection.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {connection.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(connection)}
            >
              <Edit size={14} className="mr-2" />
              Edit Connection
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                if (confirm("Are you sure you want to delete this connection?")) {
                  onDelete(connection.id);
                }
              }}
            >
              <Trash2 size={14} className="mr-2" />
              Delete Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
