import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Leaderboards page removed from navigation/routes — keep a harmless redirect
export default function LeaderboardsPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);
  return null;
}
