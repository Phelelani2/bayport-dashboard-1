"use client"

import { useState, useEffect, useMemo } from "react"
import { opportunities, branches } from "@/lib/data"
import AdvancedSearchBar from "./advanced-search-bar"
import StrategicAnalysisPanel from "./strategic-analysis-panel"
import SimpleMapView from "./simple-map-view"

const BayportLogo = () => (
  <svg width="120" height="30" viewBox="0 0 138 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.8333 3.5H22.25L14.6667 28.5H22.25L29.8333 3.5Z" fill="#482AC6" />
    <path d="M18.4167 16.3333L22.25 3.5L26.0833 16.3333L22.25 28.5L18.4167 16.3333Z" fill="#7F00FF" />
    <path d="M42.9167 3.5H35.3333L27.75 28.5H35.3333L42.9167 3.5Z" fill="#482AC6" />
    <path d="M31.5 16.3333L35.3333 3.5L39.1667 16.3333L35.3333 28.5L31.5 16.3333Z" fill="#7F00FF" />
    <path d="M11.0833 3.5H3.5L0 16L3.5 28.5H11.0833L14.5833 16L11.0833 3.5Z" fill="#482AC6" />
    <text x="48" y="23" fontFamily="Manrope, sans-serif" fontSize="24" fill="#1E1B39" fontWeight="bold">
      Bayport
    </text>
  </svg>
)

const uniqueDepartments = Array.from(new Set(opportunities.map(o => o.department)));

export default function BayportDashboard() {
  const [filters, setFilters] = useState({
    branch: "All",
    departments: [] as string[],
    employeeBin: "All", // "All", "Small", "Medium", "Large"
    distanceBin: "All", // "All", "Close", "Nearby", "Far"
    searchTerm: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [insights, setInsights] = useState("")
  const [insightTitle, setInsightTitle] = useState("Strategic Analysis")

  const selectedBranch = useMemo(() => {
    if (filters.branch === "All") return null
    return branches.find((b) => String(b.code) === filters.branch) || null
  }, [filters.branch])

  const filteredOpportunities = useMemo(() => {
    const filtered = opportunities.filter((opp) => {
      // Employee Bin Logic
      const employeeBinRanges = {
        "Small": [0, 250],
        "Medium": [251, 1000],
        "Large": [1001, 4000],
      };
      const [minEmp, maxEmp] = filters.employeeBin !== "All" ? employeeBinRanges[filters.employeeBin as keyof typeof employeeBinRanges] : [0, 4000];

      // Distance Bin Logic
      const distanceBinRanges = {
        "Close": [0, 5],
        "Nearby": [6, 15],
        "Far": [16, 30],
      };
      const [minDist, maxDist] = filters.distanceBin !== "All" ? distanceBinRanges[filters.distanceBin as keyof typeof distanceBinRanges] : [0, 30];

      const branchMatch = filters.branch === "All" || String(opp.branchCode) === filters.branch
      const departmentMatch = filters.departments.length === 0 || filters.departments.includes(opp.department)
      const employeeMatch = opp.maxEmployees >= minEmp && opp.maxEmployees <= maxEmp
      const distanceMatch = filters.branch === "All" || (opp.distance >= minDist && opp.distance <= maxDist)
      const searchMatch = filters.searchTerm === "" || opp.name.toLowerCase().includes(filters.searchTerm.toLowerCase())

      return branchMatch && departmentMatch && employeeMatch && distanceMatch && searchMatch
    })

    return filtered.sort((a, b) => b.maxEmployees - a.maxEmployees)
  }, [filters])

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      let newInsights = ""
      setInsightTitle(`Analysis for ${selectedBranch?.city || "National View"}`)

      if (filteredOpportunities.length > 0) {
        const totalPotential = filteredOpportunities.reduce((acc, opp) => acc + opp.maxEmployees, 0)
        const totalPenetration = filteredOpportunities.reduce((acc, opp) => acc + opp.currentPenetration, 0)
        const overallPenetrationRate = totalPotential > 0 ? (totalPenetration / totalPotential) * 100 : 0
        newInsights = `Your selection targets ${
          filteredOpportunities.length
        } sites with ~${totalPotential.toLocaleString()} potential clients. Current overall penetration is ${overallPenetrationRate.toFixed(
          1,
        )}%, indicating significant untapped market potential.`
      } else {
        newInsights = `No opportunities match your specific criteria. Consider widening your filters to uncover more possibilities.`
      }

      setInsights(newInsights)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [filters, selectedBranch, filteredOpportunities])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 py-4 z-20 sticky top-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <BayportLogo />
            <div>
              <h1 className="text-xl font-bold text-midnight-indigo">Agent Opportunity Portal</h1>
              <p className="text-sm text-midnight-indigo/70">Upsell & Prospecting Intelligence</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[380px_1fr] flex-1">
        <aside className="bg-card border-r p-6 overflow-y-auto">
          <div className="space-y-6 sticky top-6">
            <AdvancedSearchBar 
              filters={filters} 
              setFilters={setFilters} 
              branches={branches}
              departments={uniqueDepartments}
            />
            {selectedBranch && (
              <div className="pt-6 mt-6 border-t border-gray-200/80">
                <StrategicAnalysisPanel
                  branch={selectedBranch}
                  isLoading={isLoading}
                  insights={insights}
                  insightTitle={insightTitle}
                />
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1">
          <SimpleMapView opportunities={filteredOpportunities} selectedBranch={selectedBranch} branches={branches} />
        </main>
      </div>
    </div>
  )
}
