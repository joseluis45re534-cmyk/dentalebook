
import { useEffect } from "react";
import { useLocation } from "wouter";

export function usePageTracking() {
    const [location] = useLocation();

    useEffect(() => {
        // Debounce or simple fire
        // We use fetch directly to avoid query overhead for fire-and-forget
        fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event_type: "page_view",
                path: location
            })
        }).catch(err => console.error("Tracking error:", err)); // Silent fail
    }, [location]);
}
