"use client"

import { useEffect, useState } from "react"

export default function ProductionDiagnostics() {
  const [diagnostics, setDiagnostics] = useState({
    mapboxToken: "",
    environment: "",
    buildTime: "",
    userAgent: "",
  })

  useEffect(() => {
    setDiagnostics({
      mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_PK ? "Set" : "Missing",
      environment: process.env.NODE_ENV || "unknown",
      buildTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
    })
  }, [])

  // Only show in development or if there's an issue
  if (process.env.NODE_ENV === "production" && diagnostics.mapboxToken === "Set") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md z-50">
      <h4 className="font-bold">Production Diagnostics</h4>
      <ul className="text-sm mt-2">
        <li>Mapbox Token: {diagnostics.mapboxToken}</li>
        <li>Environment: {diagnostics.environment}</li>
        <li>Build Time: {diagnostics.buildTime}</li>
      </ul>
      {diagnostics.mapboxToken === "Missing" && (
        <p className="text-xs mt-2 font-semibold">⚠️ Add NEXT_PUBLIC_MAPBOX_PK to Vercel environment variables</p>
      )}
    </div>
  )
}
