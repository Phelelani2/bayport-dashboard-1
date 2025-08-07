"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Branch } from "@/lib/data"
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, HelpCircle, Target, Lightbulb, Users, DollarSign, Map } from 'lucide-react'

const getStatusIcon = (status: string) => {
  const iconProps = { className: "w-5 h-5 mr-2 flex-shrink-0" }
  switch (status) {
    case "VALIDATED":
      return <CheckCircle {...iconProps} className="text-success" />
    case "NEEDS ANALYSIS":
      return <AlertTriangle {...iconProps} className="text-warning" />
    case "HIGH POTENTIAL":
      return <TrendingUp {...iconProps} className="text-blue-500" />
    case "LOW POTENTIAL":
      return <TrendingDown {...iconProps} className="text-danger" />
    default:
      return <HelpCircle {...iconProps} className="text-gray-500" />
  }
}

const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
    <div className="w-12 h-12 relative">
      <motion.div
        className="w-full h-full border-4 border-dashed rounded-full border-indigo-depth"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <motion.div
        className="absolute top-0 left-0 w-full h-full border-4 border-dashed rounded-full border-electric-violet"
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
    <p className="text-sm text-midnight-indigo/80 font-medium">Analyzing...</p>
  </div>
)

interface StrategicAnalysisPanelProps {
  branch: Branch
  isLoading: boolean
  insights: string
  insightTitle: string
}

export default function StrategicAnalysisPanel({
  branch,
  isLoading,
  insights,
  insightTitle,
}: StrategicAnalysisPanelProps) {
  return (
    <motion.div
      key={branch.code}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white border-gray-200/80 shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-xl font-bold text-midnight-indigo flex items-center">
            {getStatusIcon(branch.status)}
            Branch Feasibility: {branch.city}
          </CardTitle>
          <CardDescription className="text-sm">High-level strategic overview for this location.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 p-6">
          {/* Left Column: Branch Data */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-midnight-indigo/80 flex items-center gap-1.5 text-xs">
                  <Users className="w-4 h-4 text-indigo-depth" /> Median Income
                </p>
                <p className="text-lg font-bold text-midnight-indigo">
                  R{branch.medianIncome.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="font-medium text-midnight-indigo/80 flex items-center gap-1.5 text-xs">
                  <DollarSign className="w-4 h-4 text-indigo-depth" /> Avg. Travel
                </p>
                <p className="text-lg font-bold text-midnight-indigo">{branch.avgTravelCost}</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-midnight-indigo/80 flex items-center gap-1.5 text-xs">
                <Map className="w-4 h-4 text-indigo-depth" /> Opportunity Clusters
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {branch.opportunityClusters.split("-").map((cluster) => (
                  <Badge key={cluster} variant="secondary" className="bg-lilac-mist/50 text-indigo-depth text-xs font-medium">
                    {cluster}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-midnight-indigo/80 flex items-center gap-1.5 text-xs">
                <Target className="w-4 h-4 text-indigo-depth" /> Strategic Actions
              </p>
              <p className="text-midnight-indigo font-medium text-sm">{branch.strategicActions}</p>
            </div>
          </div>

          {/* Right Column: AI Insights */}
          <div className="bg-gradient-to-tr from-indigo-depth/5 to-electric-violet/5 p-4 rounded-lg border border-indigo-depth/10 min-h-[220px] flex flex-col">
            <div className="flex-shrink-0">
              <p className="font-semibold text-midnight-indigo flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-electric-violet" /> {insightTitle}
              </p>
            </div>
            <div className="flex-grow flex items-center justify-center mt-1">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LoadingAnimation />
                  </motion.div>
                ) : (
                  <motion.p
                    key={insights}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-midnight-indigo text-sm leading-relaxed"
                  >
                    {insights}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
