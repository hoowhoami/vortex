import { useState } from "react";
import { useRedisStore } from "@/stores/redisStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Connection } from "@/types";
import { Database, Trash2, Edit, Power } from "lucide-react";

interface ConnectionListItemProps {
  connection: Connection;
  onEdit: (connection: Connection) => void;
  onDelete: (id: string) => void;
}

export function ConnectionListItem({
  connection,
  onEdit,
  onDelete,
}: ConnectionListItemProps) {
  const { connectedId, connect, disconnect } = useRedisStore();
  const [connecting, setConnecting] = useState(false);
  const isConnected = connectedId === connection.id;

  const handleConnect = async () => {
    setConnecting(true);
    try {
      if (isConnected) {
        await disconnect();
      } else {
        await connect(connection.id);
      }
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="group flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div
          className={`p-2 rounded-lg ${
            isConnected ? "bg-green-100 dark:bg-green-900" : "bg-muted"
          }`}
        >
          <Database className={isConnected ? "text-green-600 dark:text-green-400" : "text-muted-foreground"} size={20} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{connection.name}</h3>
            {isConnected && (
              <Badge variant="default" className="bg-green-600">
                Connected
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {connection.host}:{connection.port} (DB: {connection.database})
          </p>
          {connection.tags && connection.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {connection.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(connection)}
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(connection.id)}
        >
          <Trash2 size={16} className="text-destructive" />
        </Button>
        <Button
          variant={isConnected ? "destructive" : "default"}
          size="sm"
          onClick={handleConnect}
          disabled={connecting}
        >
          <Power size={16} className="mr-2" />
          {connecting ? "..." : isConnected ? "Disconnect" : "Connect"}
        </Button>
      </div>
    </div>
  );
}
