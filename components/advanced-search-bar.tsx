"use client"

import * as React from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Building, Briefcase, Users, MapPin, Search, ChevronsUpDown, Check, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { Branch } from "@/lib/data"
import { AnimatePresence, motion } from "framer-motion"

interface Filters {
  branch: string
  departments: string[]
  employeeBin: string
  distanceBin: string
  searchTerm: string
}

interface AdvancedSearchBarProps {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  branches: Branch[]
  departments: string[]
}

const employeeBins = { "Small": "0-250", "Medium": "251-1k", "Large": "1k+" }
const distanceBins = { "Close": "0-5 km", "Nearby": "6-15 km", "Far": "16-30 km" }

export default function AdvancedSearchBar({ filters, setFilters, branches, departments }: AdvancedSearchBarProps) {
  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = React.useState(false)
  const isNationalView = filters.branch === "All"

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleDepartment = (dept: string) => {
    const newDepartments = filters.departments.includes(dept)
      ? filters.departments.filter(d => d !== dept)
      : [...filters.departments, dept]
    handleFilterChange("departments", newDepartments)
  }

  const toggleBinFilter = (key: "employeeBin" | "distanceBin", value: string) => {
    const currentValue = filters[key]
    handleFilterChange(key, currentValue === value ? "All" : value)
  }
  
  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      departments: [],
      employeeBin: "All",
      distanceBin: "All",
    }))
  }

  const hasActiveFilters = filters.departments.length > 0 || filters.employeeBin !== "All" || filters.distanceBin !== "All"
  const selectedBranchName = !isNationalView ? branches.find(b => String(b.code) === filters.branch)?.city : "National View"

  return (
    <div className="p-4 bg-gradient-to-b from-prestige-grey to-white rounded-lg border border-gray-200/80 shadow-lg space-y-4">
      {/* Unified Search and Branch Selector */}
      <Popover open={isBranchSelectorOpen} onOpenChange={setIsBranchSelectorOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-12 px-3 justify-between text-left bg-white shadow-inner-sm border-gray-300/70 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-500" />
              <span className="text-base text-midnight-indigo/80 truncate">
                {filters.searchTerm || selectedBranchName}
              </span>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[348px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or select branch..."
              value={filters.searchTerm}
              onValueChange={(value) => handleFilterChange("searchTerm", value)}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Branches">
                <CommandItem onSelect={() => { handleFilterChange("branch", "All"); setIsBranchSelectorOpen(false); }}>
                  <Building className="mr-2 h-4 w-4" /> National View
                </CommandItem>
                {branches.map((branch) => (
                  <CommandItem key={branch.code} onSelect={() => { handleFilterChange("branch", String(branch.code)); handleFilterChange("searchTerm", ""); setIsBranchSelectorOpen(false); }}>
                    <Building className="mr-2 h-4 w-4" /> {branch.city}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Filter Sections */}
      <div className="space-y-4 pt-2">
        <FilterSectionHeader title="Refine Selection" onClear={clearFilters} showClear={hasActiveFilters} />
        
        <FilterSection icon={Briefcase} title="Department" color="text-electric-violet">
          {departments.map(dept => (
            <FilterTag
              key={dept}
              isActive={filters.departments.includes(dept)}
              onClick={() => toggleDepartment(dept)}
              color="violet"
            >
              {dept}
            </FilterTag>
          ))}
        </FilterSection>

        <FilterSection icon={Users} title="Employee Size" color="text-blue-500">
          {Object.entries(employeeBins).map(([key, label]) => (
            <FilterTag
              key={key}
              isActive={filters.employeeBin === key}
              onClick={() => toggleBinFilter("employeeBin", key)}
              color="blue"
            >
              {label}
            </FilterTag>
          ))}
        </FilterSection>

        <FilterSection icon={MapPin} title="Distance" color="text-green-500" disabled={isNationalView}>
          {Object.entries(distanceBins).map(([key, label]) => (
            <FilterTag
              key={key}
              isActive={filters.distanceBin === key}
              onClick={() => toggleBinFilter("distanceBin", key)}
              disabled={isNationalView}
              color="green"
            >
              {label}
            </FilterTag>
          ))}
        </FilterSection>
      </div>
    </div>
  )
}

const FilterSectionHeader = ({ title, onClear, showClear }: { title: string, onClear: () => void, showClear: boolean }) => (
  <div className="flex justify-between items-center">
    <h3 className="text-base font-semibold text-midnight-indigo">{title}</h3>
    <AnimatePresence>
      {showClear && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
          <Button variant="ghost" size="sm" onClick={onClear} className="text-sm text-gray-500 hover:text-danger hover:bg-red-50 h-8 px-2">
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

const FilterSection = ({ icon: Icon, title, color, disabled = false, children }: { icon: React.ElementType, title: string, color: string, disabled?: boolean, children: React.ReactNode }) => (
  <div className={cn(disabled && "opacity-50 pointer-events-none")}>
    <p className={cn("text-sm font-semibold text-midnight-indigo/80 mb-2 flex items-center gap-2", color)}>
      <Icon className="w-4 h-4" /> {title}
    </p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
)

const FilterTag = ({ isActive, color, children, ...props }: React.ComponentProps<typeof Button> & { isActive: boolean, color: 'violet' | 'blue' | 'green' }) => {
  const colorClasses = {
    violet: {
      active: "bg-electric-violet text-white border-transparent hover:bg-electric-violet/90",
      inactive: "text-electric-violet border-electric-violet/30 bg-electric-violet/5 hover:bg-electric-violet/10"
    },
    blue: {
      active: "bg-blue-500 text-white border-transparent hover:bg-blue-500/90",
      inactive: "text-blue-600 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
    },
    green: {
      active: "bg-green-500 text-white border-transparent hover:bg-green-500/90",
      inactive: "text-green-600 border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
    }
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "rounded-full h-8 text-sm font-medium transition-all duration-200 border flex items-center gap-1",
        isActive ? colorClasses[color].active : colorClasses[color].inactive,
        props.disabled && "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-100 cursor-not-allowed"
      )}
      {...props}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </Button>
  )
}
