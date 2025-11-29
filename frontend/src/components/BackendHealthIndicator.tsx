import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/services/api";

interface HealthResponse {
  status: string;
  db: string;
}

export const BackendHealthIndicator = () => {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/healthz`);
        if (response.ok) {
          const data: HealthResponse = await response.json();
          if (data.status === "ok" && data.db === "connected") {
            setStatus("connected");
          } else {
            setStatus("disconnected");
          }
        } else {
          setStatus("disconnected");
        }
      } catch (error) {
        console.error("Health check failed:", error);
        setStatus("disconnected");
      }
    };

    checkHealth();
    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant={status === "connected" ? "default" : "destructive"}
        className={cn(
          "shadow-lg transition-all duration-300",
          status === "connected" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
        )}
      >
        {status === "connected" ? "System Operational" : "System Offline"}
      </Badge>
    </div>
  );
};