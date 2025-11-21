import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { getData, formatWithCommas, clearDataCache, type ShovelMarketData, getProductTypeHierarchy, getSalesChannelHierarchy } from '../utils/dataGenerator'
import { StatBox } from '../components/StatBox'
import { FilterDropdown } from '../components/FilterDropdown'
import { HierarchicalFilterDropdown } from '../components/HierarchicalFilterDropdown'
import { NestedHierarchicalFilterDropdown } from '../components/NestedHierarchicalFilterDropdown'
import { SegmentGroupedBarChart } from '../components/SegmentGroupedBarChart'
import { RegionCountryStackedBarChart } from '../components/RegionCountryStackedBarChart'
import { CrossSegmentStackedBarChart } from '../components/CrossSegmentStackedBarChart'
import { DemoNotice } from '../components/DemoNotice'
import { useTheme } from '../context/ThemeContext'
import { InfoTooltip } from '../components/InfoTooltip'
import { WaterfallChart } from '../components/WaterfallChart'
import { BubbleChart } from '../components/BubbleChart'
import { YoYCAGRChart } from '../components/YoYCAGRChart'

interface MarketAnalysisProps {
  onNavigate: (page: string) => void
}

type MarketEvaluationType = 'By Value' | 'By Volume'

export function MarketAnalysis({ onNavigate }: MarketAnalysisProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [activeTab, setActiveTab] = useState<'standard' | 'incremental' | 'attractiveness' | 'yoy'>('standard')
  const [data, setData] = useState<ShovelMarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    year: [] as number[],
    country: [] as string[], // Using for region
    productType: [] as string[],
    bladeMaterial: [] as string[],
    handleLength: [] as string[],
    application: [] as string[],
    endUser: [] as string[], // Using for profession
    distributionChannelType: [] as string[], // Using for sales channel
    distributionChannel: [] as string[],
    marketEvaluation: 'By Value' as MarketEvaluationType,
  })
  
  // Separate filters for incremental tab
  const [incrementalFilters, setIncrementalFilters] = useState({
    region: [] as string[],
    productType: [] as string[],
  })
  
  // Separate filters for attractiveness tab
  const [attractivenessFilters, setAttractivenessFilters] = useState({
    region: [] as string[],
    segmentType: '' as string, // 'productType' | 'bladeMaterial' | 'handleLength' | 'application' | 'endUser' | 'distributionChannelType'
    segmentValues: [] as string[],
  })
  
  // Separate filters for YoY/CAGR tab
  const [yoyFilters, setYoyFilters] = useState({
    region: [] as string[],
    segmentType: '' as string,
    segmentValues: [] as string[],
    country: [] as string[],
  })

  useEffect(() => {
    // Clear cache to ensure fresh data with online channels
    clearDataCache()
    setLoading(true)
    setTimeout(() => {
      try {
        const generatedData = getData()
        setData(generatedData)
        setLoading(false)
        
        setTimeout(() => {
          const availableYears = [...new Set(generatedData.map(d => d.year))].sort()
          const availableRegions = [...new Set(generatedData.map(d => d.region))].filter(Boolean).sort()
          const availableProductTypes = [...new Set(generatedData.map(d => d.productType))].sort()
          const availableBladeMaterials = [...new Set(generatedData.map(d => d.bladeMaterial))].filter(Boolean).sort()
          const availableHandleLengths = [...new Set(generatedData.map(d => d.handleLength))].filter(Boolean).sort()
          const availableApplications = [...new Set(generatedData.map(d => d.application))].filter(Boolean).sort()
          const availableProfessions = [...new Set(generatedData.map(d => d.endUser))].filter(Boolean).sort()
          const availableSalesChannels = [...new Set(generatedData.map(d => d.distributionChannelType))].filter(Boolean).sort()
          // Default to 2024 and 2025 if available, otherwise use first 2 available years
          const defaultYears = availableYears.includes(2024) && availableYears.includes(2025)
            ? [2024, 2025]
            : availableYears.length >= 2
              ? availableYears.slice(-2)
              : availableYears
          
          // Default to first 2 items from each filter
          const defaultRegions = availableRegions.slice(0, 2)
          const defaultProductTypes = availableProductTypes.slice(0, 2)
          const defaultBladeMaterials = availableBladeMaterials.slice(0, 2)
          const defaultHandleLengths = availableHandleLengths.slice(0, 2)
          const defaultApplications = availableApplications.slice(0, 2)
          const defaultProfessions = availableProfessions.slice(0, 2)
          const defaultSalesChannels = availableSalesChannels.slice(0, 2)
          
          setFilters({
            year: defaultYears,
            country: defaultRegions,
            productType: defaultProductTypes,
            bladeMaterial: defaultBladeMaterials,
            handleLength: defaultHandleLengths,
            application: defaultApplications,
            endUser: defaultProfessions,
            distributionChannelType: defaultSalesChannels,
            distributionChannel: [],
            marketEvaluation: 'By Value',
          })
          
          // Initialize attractiveness filters with all regions by default
          // Only set if filters are currently empty (first load)
          setAttractivenessFilters(prev => ({
            region: prev.region.length === 0 ? availableRegions : prev.region, // All regions selected by default
            segmentType: prev.segmentType || '', // No segment selected by default
            segmentValues: prev.segmentValues || [], // No segment values selected by default
          }))
          
          // Initialize YoY/CAGR filters with all regions by default
          // Only set if filters are currently empty (first load)
          setYoyFilters(prev => ({
            region: prev.region.length === 0 ? availableRegions : prev.region, // All regions selected by default
            segmentType: prev.segmentType || '', // No segment selected by default
            segmentValues: prev.segmentValues || [], // No segment values selected by default
            country: [], // Country filter removed, keep empty
          }))
        }, 0)
      } catch (error) {
        console.error('Error loading data:', error)
        setData([])
        setLoading(false)
      }
    }, 500)
  }, [])

  // Get unique filter options - optimized
  const uniqueOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        years: [],
        countries: [],
        productTypes: [],
        bladeMaterials: [],
        handleLengths: [],
        applications: [],
        endUsers: [],
        distributionChannelTypes: [],
      }
    }

    const yearSet = new Set<number>()
    const countrySet = new Set<string>()
    const productTypeSet = new Set<string>()
    const bladeMaterialSet = new Set<string>()
    const handleLengthSet = new Set<string>()
    const applicationSet = new Set<string>()
    const endUserSet = new Set<string>()
    const distributionChannelTypeSet = new Set<string>()

    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      if (d.year) yearSet.add(d.year)
      if (d.region) countrySet.add(d.region) // Map region to country field
      if (d.productType) productTypeSet.add(d.productType)
      if (d.bladeMaterial) bladeMaterialSet.add(d.bladeMaterial)
      if (d.handleLength) handleLengthSet.add(d.handleLength)
      if (d.application) applicationSet.add(d.application)
      if (d.endUser) endUserSet.add(d.endUser) // This contains profession data
      if (d.distributionChannelType) {
        distributionChannelTypeSet.add(d.distributionChannelType) // This contains sales channel data
      }
    }

    const foundTypes = Array.from(distributionChannelTypeSet)
    const foundYears = Array.from(yearSet).sort()
    const foundCountries = Array.from(countrySet).filter(Boolean).sort()
    const foundHandleLengths = Array.from(handleLengthSet).filter(Boolean).sort()
    const foundApplications = Array.from(applicationSet).filter(Boolean).sort()
    const foundEndUsers = Array.from(endUserSet).filter(Boolean).sort()
    const foundProductTypes = Array.from(productTypeSet).filter(Boolean).sort()
    const foundBladeMaterials = Array.from(bladeMaterialSet).filter(Boolean).sort()

    return {
      years: Array.from(yearSet).sort((a, b) => a - b),
      countries: foundCountries || [],
      productTypes: Array.from(productTypeSet).filter(Boolean).sort(),
      bladeMaterials: Array.from(bladeMaterialSet).filter(Boolean).sort(),
      handleLengths: Array.from(handleLengthSet).filter(Boolean).sort(),
      applications: Array.from(applicationSet).filter(Boolean).sort(),
      endUsers: Array.from(endUserSet).filter(Boolean).sort(),
      distributionChannelTypes: Array.from(distributionChannelTypeSet).filter(Boolean).sort(),
    }
  }, [data])

  // Get all distribution channels from full data, grouped by type
  const distributionChannelGroupedOptions = useMemo(() => {
    const offlineChannels = ['Hardware Stores', 'Specialty Garden Centers', 'Agricultural Supply Stores']
    const onlineChannels = ['Ecommerce Website', "Brand's/Company's Own Website"]
    
    // Get all channels that exist in the data
    if (!data || data.length === 0) return []
    
    const channelSet = new Set<string>()
    data.forEach(d => {
      if (d.distributionChannel) channelSet.add(d.distributionChannel)
    })
    
    const allChannels = Array.from(channelSet)
    
    // Filter channels based on selected types
    const groups: Array<{ group: string; items: string[] }> = []
    
    if (filters.distributionChannelType.length === 0) {
      // No type selected - show all channels grouped
      const availableOffline = offlineChannels.filter(ch => allChannels.includes(ch))
      const availableOnline = onlineChannels.filter(ch => allChannels.includes(ch))
      
      if (availableOffline.length > 0) {
        groups.push({
          group: 'Offline',
          items: availableOffline
        })
      }
      
      if (availableOnline.length > 0) {
        groups.push({
          group: 'Online',
          items: availableOnline
        })
      }
    } else {
      // Show only channels for selected types, but always show both groups if both types are selected
      const hasOffline = filters.distributionChannelType.includes('Offline')
      const hasOnline = filters.distributionChannelType.includes('Online')
      
      if (hasOffline) {
        const availableOffline = offlineChannels.filter(ch => allChannels.includes(ch))
        if (availableOffline.length > 0) {
          groups.push({
            group: 'Offline',
            items: availableOffline
          })
        }
      }
      
      if (hasOnline) {
        const availableOnline = onlineChannels.filter(ch => allChannels.includes(ch))
        if (availableOnline.length > 0) {
          groups.push({
            group: 'Online',
            items: availableOnline
          })
        }
      }
    }
    
    return groups
  }, [data, filters.distributionChannelType])

  // Get flat list of available distribution channels based on selected types
  const availableDistributionChannels = useMemo(() => {
    if (!data || data.length === 0) return []
    
    const channelSet = new Set<string>()
    
    if (filters.distributionChannelType.length === 0) {
      // No type filter - include all channels
      data.forEach(d => {
        if (d.distributionChannel) channelSet.add(d.distributionChannel)
      })
    } else {
      // Filter by selected types
      const filteredData = data.filter(d => 
        filters.distributionChannelType.includes(d.distributionChannelType)
      )
      filteredData.forEach(d => {
        if (d.distributionChannel) channelSet.add(d.distributionChannel)
      })
    }
    
    return Array.from(channelSet).sort()
  }, [data, filters.distributionChannelType])

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    if (filters.year.length > 0) {
      filtered = filtered.filter(d => filters.year.includes(d.year))
    }
    if (filters.country.length > 0) {
      filtered = filtered.filter(d => filters.country.includes(d.region))
    }
    if (filters.productType.length > 0) {
      filtered = filtered.filter(d => filters.productType.includes(d.productType))
    }
    if (filters.bladeMaterial.length > 0) {
      filtered = filtered.filter(d => filters.bladeMaterial.includes(d.bladeMaterial))
    }
    if (filters.handleLength.length > 0) {
      filtered = filtered.filter(d => filters.handleLength.includes(d.handleLength))
    }
    if (filters.application.length > 0) {
      filtered = filtered.filter(d => filters.application.includes(d.application))
    }
    if (filters.endUser.length > 0) {
      filtered = filtered.filter(d => filters.endUser.includes(d.endUser))
    }
    if (filters.distributionChannelType.length > 0) {
      filtered = filtered.filter(d => filters.distributionChannelType.includes(d.distributionChannelType))
    }

    return filtered
  }, [data, filters])

  // Get data value based on market evaluation type
  const getDataValue = (d: any): number => {
    if (filters.marketEvaluation === 'By Volume') {
      return d.volumeUnits || 0
    }
    return (d.marketValueUsd || 0) / 1000 // Convert to millions
  }

  const getDataLabel = (): string => {
    return filters.marketEvaluation === 'By Volume' ? 'Market Volume (Units)' : 'Market Size (US$ Million)'
  }

  // Analysis data for charts - Market segment based
  const analysisData = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        productTypeChartData: [],
        productTypeStackedData: { chartData: [], segments: [] },
        productTypeIsStacked: false,
        bladeMaterialChartData: [],
        handleLengthChartData: [],
        applicationChartData: [],
        endUserChartData: [],
        countryChartData: [],
        regionCountryPercentageChartData: [],
        productTypes: [] as string[],
        bladeMaterials: [] as string[],
        handleLengths: [] as string[],
        applications: [] as string[],
        endUsers: [] as string[],
        countries: [] as string[],
        bladeMaterialStackedData: { chartData: [], segments: [] },
        handleLengthStackedData: { chartData: [], segments: [] },
        applicationStackedData: { chartData: [], segments: [] },
        endUserStackedData: { chartData: [], segments: [] },
        distributionChannelTypeStackedData: { chartData: [], segments: [] },
        offlineChannelStackedData: { chartData: [], segments: [] },
        onlineChannelStackedData: { chartData: [], segments: [] },
      }
    }

    const years = [...new Set(filteredData.map(d => d.year))].sort()

    // Helper function to generate segment chart data
    const generateSegmentChartData = (
      segmentKey: string,
      getSegmentValue: (d: any) => string,
      selectedSegments?: string[]
    ) => {
      // Use selected segments from filter if provided, otherwise use segments from filtered data
      const segmentsFromData = [...new Set(filteredData.map(getSegmentValue))].filter(Boolean).sort()
      const segments = selectedSegments && selectedSegments.length > 0 
        ? selectedSegments.filter(s => s).sort() 
        : segmentsFromData
      
      const segmentMap = new Map<string, number>()
      
      filteredData.forEach(d => {
        const key = `${d.year}-${getSegmentValue(d)}`
        segmentMap.set(key, (segmentMap.get(key) || 0) + getDataValue(d))
      })

      const chartData = years.map((year) => {
        const entry: Record<string, number | string> = { year: String(year) }
        segments.forEach((segment) => {
          const key = `${year}-${segment}`
          entry[segment] = segmentMap.get(key) || 0
        })
        return entry
      })

      return { chartData, segments }
    }

    // Helper function to generate year-wise stacked bar chart data
    const generateYearWiseStackedBarData = (
      getSegmentValue: (d: any) => string,
      selectedSegments?: string[]
    ) => {
      const segmentsFromData = [...new Set(filteredData.map(getSegmentValue))].filter(Boolean).sort()
      const segments = selectedSegments && selectedSegments.length > 0 
        ? selectedSegments.filter(s => s).sort() 
        : segmentsFromData
      
      // Group by year, then by segment
      const yearSegmentMap = new Map<number, Map<string, number>>()
      
      filteredData.forEach(d => {
        const year = d.year
        const segment = getSegmentValue(d)
        if (segment) {
          if (!yearSegmentMap.has(year)) {
            yearSegmentMap.set(year, new Map<string, number>())
          }
          const segmentMap = yearSegmentMap.get(year)!
          segmentMap.set(segment, (segmentMap.get(segment) || 0) + getDataValue(d))
        }
      })

      // Convert to array format for stacked bar chart
      const chartData = years.map(year => {
        const entry: Record<string, number | string> = { year: String(year) }
        const segmentMap = yearSegmentMap.get(year) || new Map<string, number>()
        segments.forEach(segment => {
          entry[segment] = segmentMap.get(segment) || 0
        })
        return entry
      })

      // Filter segments that have at least one non-zero value
      const activeSegments = segments.filter(segment => 
        chartData.some(entry => (entry[segment] as number) > 0)
      )

      return { chartData, segments: activeSegments }
    }

    // Product Type Chart - special handling for parent-child relationships
    // If a parent (like "Body Care") is selected, show it as a stacked bar with its children, not the parent as a separate bar
    const generateProductTypeChartData = () => {
      const hierarchy = getProductTypeHierarchy()
      const selectedProductTypes = filters.productType.length > 0 ? filters.productType : []
      
      // Get all available product types from data
      const allProductTypesFromData = [...new Set(filteredData.map(d => d.productType))].filter(Boolean).sort()
      
      // Build a map of parent to children
      const parentToChildren = new Map<string, string[]>()
      hierarchy.forEach(item => {
        const parent = item.mainCategory
        const children = item.subCategories.map(sub => `${parent} - ${sub}`)
        parentToChildren.set(parent, children)
      })
      
      // Check if any selected product types are parents
      const selectedParents = selectedProductTypes.filter(selected => parentToChildren.has(selected))
      const selectedChildren = selectedProductTypes.filter(selected => !parentToChildren.has(selected))
      
      // If we have selected parents, create stacked bar chart data
      // For now, handle single parent case - show stacked bar with its children
      if (selectedParents.length === 1 && selectedChildren.length === 0) {
        const parent = selectedParents[0]
        const children = parentToChildren.get(parent)!
        const validChildren = children.filter(child => allProductTypesFromData.includes(child))
        
        if (validChildren.length > 0) {
          const yearChildMap = new Map<number, Map<string, number>>()
          
          filteredData.forEach(d => {
            const productType = d.productType || ''
            if (validChildren.includes(productType)) {
              const year = d.year
              if (!yearChildMap.has(year)) {
                yearChildMap.set(year, new Map<string, number>())
              }
              const childMap = yearChildMap.get(year)!
              childMap.set(productType, (childMap.get(productType) || 0) + getDataValue(d))
            }
          })
          
          const chartData = years.map(year => {
            const entry: Record<string, number | string> = { year: String(year) }
            const childMap = yearChildMap.get(year) || new Map<string, number>()
            validChildren.forEach(child => {
              entry[child] = childMap.get(child) || 0
            })
            return entry
          })
          
          return {
            chartData: [],
            segments: [],
            stackedChartData: chartData,
            stackedSegments: validChildren,
            isStacked: true
          }
        }
      }
      
      // Default: grouped bar chart (no parents selected, or mixed selection)
      let segmentsToShow: string[] = []
      
      if (selectedProductTypes.length > 0) {
        selectedProductTypes.forEach(selected => {
          // Check if this is a parent category
          if (parentToChildren.has(selected)) {
            // It's a parent - add its children instead (for grouped view)
            const children = parentToChildren.get(selected)!
            children.forEach(child => {
              if (allProductTypesFromData.includes(child)) {
                segmentsToShow.push(child)
              }
            })
          } else {
            // It's a child or standalone - add it directly
            if (allProductTypesFromData.includes(selected)) {
              segmentsToShow.push(selected)
            }
          }
        })
      } else {
        // No selection - show all product types from data
        segmentsToShow = allProductTypesFromData
      }
      
      // Remove duplicates and sort
      segmentsToShow = [...new Set(segmentsToShow)].sort()
      
      // Generate chart data
      const segmentMap = new Map<string, number>()
      
      filteredData.forEach(d => {
        const productType = d.productType || ''
        if (segmentsToShow.includes(productType)) {
          const key = `${d.year}-${productType}`
          segmentMap.set(key, (segmentMap.get(key) || 0) + getDataValue(d))
        }
      })

      const chartData = years.map((year) => {
        const entry: Record<string, number | string> = { year: String(year) }
        segmentsToShow.forEach((segment) => {
          const key = `${year}-${segment}`
          entry[segment] = segmentMap.get(key) || 0
        })
        return entry
      })

      return { 
        chartData, 
        segments: segmentsToShow,
        stackedChartData: [],
        stackedSegments: [],
        isStacked: false
      }
    }
    
    const productTypeData = generateProductTypeChartData()

    // Blade Material Chart - use selected filters to show all selected options
    const bladeMaterialData = generateSegmentChartData(
      'bladeMaterial', 
      (d) => d.bladeMaterial || '',
      filters.bladeMaterial.length > 0 ? filters.bladeMaterial : undefined
    )

    // Handle Length Chart - use selected filters to show all selected options
    const handleLengthData = generateSegmentChartData(
      'handleLength', 
      (d) => d.handleLength || '',
      filters.handleLength.length > 0 ? filters.handleLength : undefined
    )

    // Application Chart - use selected filters to show all selected options
    const applicationData = generateSegmentChartData(
      'application', 
      (d) => d.application || '',
      filters.application.length > 0 ? filters.application : undefined
    )

    // End User Chart - use selected filters to show all selected options
    const endUserData = generateSegmentChartData(
      'endUser', 
      (d) => d.endUser || '',
      filters.endUser.length > 0 ? filters.endUser : undefined
    )

    // Country Chart - use selected filters to show all selected options
    const countriesFromData = [...new Set(filteredData.map(d => d.country))].filter(Boolean).sort()
    const countries = filters.country.length > 0 
      ? filters.country.filter(c => c).sort() 
      : countriesFromData
    const countryMap = new Map<string, number>()
    filteredData.forEach(d => {
      const key = `${d.year}-${d.country}`
      countryMap.set(key, (countryMap.get(key) || 0) + getDataValue(d))
    })
    const countryChartData = years.map((year) => {
      const entry: Record<string, number | string> = { year: String(year) }
      countries.forEach((country) => {
        const key = `${year}-${country}`
        entry[country] = countryMap.get(key) || 0
      })
      return entry
    })


    // Region Country Percentage - Grouped by Year
    const regionYearData: Record<string, Record<string, Record<string, number>>> = {}
    const regionYearTotals: Record<string, Record<string, number>> = {}
    
    filteredData.forEach((d) => {
      const value = getDataValue(d)
      const year = d.year
      const region = d.region
      const country = d.country
      const yearKey = String(year)
      
      if (!regionYearData[yearKey]) {
        regionYearData[yearKey] = {}
        regionYearTotals[yearKey] = {}
      }
      if (!regionYearData[yearKey][region]) {
        regionYearData[yearKey][region] = {}
        regionYearTotals[yearKey][region] = 0
      }
      if (!regionYearData[yearKey][region][country]) {
        regionYearData[yearKey][region][country] = 0
      }
      
      regionYearData[yearKey][region][country] += value
      regionYearTotals[yearKey][region] += value
    })
    
    const regionCountryPercentageChartData = Object.entries(regionYearData).flatMap(([year, regionData]) => {
      return Object.entries(regionData).flatMap(([region, countriesData]) => {
        const totalValue = regionYearTotals[year][region]
        const countryList = Object.keys(countriesData).sort()
        
        return countryList.map((country) => {
          const value = countriesData[country] || 0
          const percentage = totalValue > 0 ? ((value / totalValue) * 100) : 0
          
          return {
            year: Number(year),
            region,
            country,
            value: filters.marketEvaluation === 'By Volume' ? value : percentage,
            yearRegion: `${year} - ${region}`
          }
        })
      })
    })

    // Generate year-wise stacked bar chart data for share analysis
    const bladeMaterialStackedData = generateYearWiseStackedBarData(
      (d) => d.bladeMaterial || '',
      filters.bladeMaterial.length > 0 ? filters.bladeMaterial : undefined
    )
    const handleLengthStackedData = generateYearWiseStackedBarData(
      (d) => d.handleLength || '',
      filters.handleLength.length > 0 ? filters.handleLength : undefined
    )
    const applicationStackedData = generateYearWiseStackedBarData(
      (d) => d.application || '',
      filters.application.length > 0 ? filters.application : undefined
    )
    const endUserStackedData = generateYearWiseStackedBarData(
      (d) => d.endUser || '',
      filters.endUser.length > 0 ? filters.endUser : undefined
    )

    // Generate distribution channel type stacked bar chart data (Online vs Offline)
    const distributionChannelTypeStackedData = generateYearWiseStackedBarData(
      (d) => d.distributionChannelType || '',
      filters.distributionChannelType.length > 0 ? filters.distributionChannelType : undefined
    )

    // Generate distribution channel subtype stacked bar chart data
    // Only show if a distribution channel type is selected
    let offlineChannelStackedData: { chartData: Array<Record<string, number | string>>; segments: string[] } = { chartData: [], segments: [] }
    let onlineChannelStackedData: { chartData: Array<Record<string, number | string>>; segments: string[] } = { chartData: [], segments: [] }
    
    if (filters.distributionChannelType.length > 0) {
      // Filter data for offline channels
      if (filters.distributionChannelType.includes('Offline')) {
        const offlineData = filteredData.filter(d => d.distributionChannelType === 'Offline')
        const offlineChannels = [...new Set(offlineData.map(d => d.distributionChannel))].filter(Boolean).sort() as string[]
        
        const yearChannelMap = new Map<number, Map<string, number>>()
        offlineData.forEach(d => {
          const year = d.year
          const channel = d.distributionChannel
          if (channel) {
            if (!yearChannelMap.has(year)) {
              yearChannelMap.set(year, new Map<string, number>())
            }
            const channelMap = yearChannelMap.get(year)!
            channelMap.set(channel, (channelMap.get(channel) || 0) + getDataValue(d))
          }
        })
        
        const chartData = years.map(year => {
          const entry: Record<string, number | string> = { year: String(year) }
          const channelMap = yearChannelMap.get(year) || new Map<string, number>()
          offlineChannels.forEach(channel => {
            entry[channel] = channelMap.get(channel) || 0
          })
          return entry
        })
        
        const activeChannels = offlineChannels.filter(channel => 
          chartData.some(entry => (entry[channel] as number) > 0)
        )
        
        offlineChannelStackedData = { chartData, segments: activeChannels }
      }
      
      // Filter data for online channels
      if (filters.distributionChannelType.includes('Online')) {
        const onlineData = filteredData.filter(d => d.distributionChannelType === 'Online')
        const onlineChannels = [...new Set(onlineData.map(d => d.distributionChannel))].filter(Boolean).sort() as string[]
        
        const yearChannelMap = new Map<number, Map<string, number>>()
        onlineData.forEach(d => {
          const year = d.year
          const channel = d.distributionChannel
          if (channel) {
            if (!yearChannelMap.has(year)) {
              yearChannelMap.set(year, new Map<string, number>())
            }
            const channelMap = yearChannelMap.get(year)!
            channelMap.set(channel, (channelMap.get(channel) || 0) + getDataValue(d))
          }
        })
        
        const chartData = years.map(year => {
          const entry: Record<string, number | string> = { year: String(year) }
          const channelMap = yearChannelMap.get(year) || new Map<string, number>()
          onlineChannels.forEach(channel => {
            entry[channel] = channelMap.get(channel) || 0
          })
          return entry
        })
        
        const activeChannels = onlineChannels.filter(channel => 
          chartData.some(entry => (entry[channel] as number) > 0)
        )
        
        onlineChannelStackedData = { chartData, segments: activeChannels }
      }
    }

    return {
      productTypeChartData: productTypeData.chartData,
      productTypeStackedData: { 
        chartData: productTypeData.stackedChartData, 
        segments: productTypeData.stackedSegments 
      },
      productTypeIsStacked: productTypeData.isStacked,
      bladeMaterialChartData: bladeMaterialData.chartData,
      handleLengthChartData: handleLengthData.chartData,
      applicationChartData: applicationData.chartData,
      endUserChartData: endUserData.chartData,
      countryChartData,
      regionCountryPercentageChartData,
      productTypes: productTypeData.segments,
      bladeMaterials: bladeMaterialData.segments,
      handleLengths: handleLengthData.segments,
      applications: applicationData.segments,
      endUsers: endUserData.segments,
      countries,
      // Year-wise stacked bar chart data for share analysis
      bladeMaterialStackedData,
      handleLengthStackedData,
      applicationStackedData,
      endUserStackedData,
      distributionChannelTypeStackedData,
      offlineChannelStackedData,
      onlineChannelStackedData,
    }
  }, [filteredData, filters.marketEvaluation, filters.productType, filters.bladeMaterial, filters.handleLength, filters.application, filters.endUser, filters.country, filters.distributionChannelType])

  // KPI Stats
  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalValue: 'N/A',
      }
    }

    const totalValue = filteredData.reduce((sum, d) => sum + getDataValue(d), 0)

    return {
      totalValue: filters.marketEvaluation === 'By Volume' 
        ? `${formatWithCommas(totalValue / 1000, 1)}K Units`
        : `${formatWithCommas(totalValue, 1)}M`,
    }
  }, [filteredData, filters.marketEvaluation])

  // Get unique options for incremental filters
  const incrementalFilterOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        regions: [],
        productTypes: [],
      }
    }
    
    const regionSet = new Set<string>()
    const productTypeSet = new Set<string>()
    
    data.forEach(d => {
      if (d.region) regionSet.add(d.region)
      if (d.productType) productTypeSet.add(d.productType)
    })
    
    return {
      regions: Array.from(regionSet).sort(),
      productTypes: Array.from(productTypeSet).sort(),
    }
  }, [data])

  // Filter data for incremental chart
  const filteredIncrementalData = useMemo(() => {
    let filtered = [...data]
    
    if (incrementalFilters.region.length > 0) {
      filtered = filtered.filter(d => incrementalFilters.region.includes(d.region))
    }
    if (incrementalFilters.productType.length > 0) {
      filtered = filtered.filter(d => incrementalFilters.productType.includes(d.productType))
    }
    
    return filtered
  }, [data, incrementalFilters])

  // Waterfall Chart Data (Incremental Opportunity) - based on filters
  const waterfallData = useMemo(() => {
    // Calculate base value from 2024 data
    const baseYearData = filteredIncrementalData.filter(d => d.year === 2024)
    const baseValue = baseYearData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0) || 57159
    
    // Calculate incremental values for each year
    const incrementalValues = []
    for (let year = 2025; year <= 2031; year++) {
      const yearData = filteredIncrementalData.filter(d => d.year === year)
      const prevYearData = filteredIncrementalData.filter(d => d.year === year - 1)
      
      const yearValue = yearData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0)
      const prevYearValue = prevYearData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0)
      
      // If no data, use default incremental values scaled by filter
      const incremental = yearValue > 0 && prevYearValue > 0
        ? yearValue - prevYearValue
        : [2638.4, 2850.4, 3055.6, 3231.0, 3432.9, 3674.2, 3885.1][year - 2025] * (baseValue / 57159)
      
      incrementalValues.push({ year: String(year), value: incremental })
    }
    
    let cumulative = baseValue
    const chartData = [
      { year: '2024', baseValue, totalValue: baseValue, isBase: true },
      ...incrementalValues.map(item => {
        cumulative += item.value
        return {
          year: item.year,
          incrementalValue: item.value,
          totalValue: cumulative,
        }
      }),
      { year: '2032', baseValue: cumulative, totalValue: cumulative, isTotal: true },
    ]
    
    const totalIncremental = incrementalValues.reduce((sum, item) => sum + item.value, 0)
    
    return { chartData, incrementalOpportunity: totalIncremental }
  }, [filteredIncrementalData])

  // Get unique options for attractiveness filters
  const attractivenessFilterOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        regions: [],
        productTypes: [],
      }
    }
    
    const regionSet = new Set<string>()
    const productTypeSet = new Set<string>()
    
    data.forEach(d => {
      if (d.region) {
        // Only include India regions
        const indiaRegions = ['North India', 'South India', 'East India', 'West India', 'Central India']
        if (indiaRegions.includes(d.region)) {
          regionSet.add(d.region)
        }
      }
      if (d.productType) productTypeSet.add(d.productType)
    })
    
    return {
      regions: Array.from(regionSet).sort(),
      productTypes: Array.from(productTypeSet).sort(),
    }
  }, [data])

  // Filter data for attractiveness chart
  const filteredAttractivenessData = useMemo(() => {
    let filtered = [...data]
    
    // Filter by year range 2025-2032
    filtered = filtered.filter(d => d.year >= 2025 && d.year <= 2032)
    
    if (attractivenessFilters.region.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.region.includes(d.region))
    }
    
    // Filter by selected segment type and values
    if (attractivenessFilters.segmentType && attractivenessFilters.segmentValues.length > 0) {
      const segmentType = attractivenessFilters.segmentType
      const segmentValues = attractivenessFilters.segmentValues
      
      // Get all sub-elements for hierarchical segments
      let allSegmentValues = [...segmentValues]
      
      // For Product Type, expand hierarchical values to include all sub-items
      if (segmentType === 'productType') {
        const hierarchy = getProductTypeHierarchy()
        const expandedValues = new Set<string>(segmentValues)
        
        // Recursively find all children of selected items
        const findChildren = (items: any[]) => {
          items.forEach(item => {
            if (segmentValues.includes(item.value)) {
              if (item.children) {
                item.children.forEach((child: any) => {
                  expandedValues.add(child.value)
                  if (child.children) {
                    findChildren(child.children)
                  }
                })
              }
            } else if (item.children) {
              findChildren(item.children)
            }
          })
        }
        findChildren(hierarchy)
        allSegmentValues = Array.from(expandedValues)
      }
      
      // For Sales Channel, expand hierarchical values
      if (segmentType === 'distributionChannelType') {
        const hierarchy = getSalesChannelHierarchy()
        const expandedValues = new Set<string>(segmentValues)
        
        const findChildren = (items: any[]) => {
          items.forEach(item => {
            if (segmentValues.includes(item.value)) {
              if (item.children) {
                item.children.forEach((child: any) => {
                  expandedValues.add(child.value)
                  if (child.children) {
                    findChildren(child.children)
                  }
                })
              }
            } else if (item.children) {
              findChildren(item.children)
            }
          })
        }
        findChildren(hierarchy)
        allSegmentValues = Array.from(expandedValues)
      }
      
      // Apply filter based on segment type
      filtered = filtered.filter(d => {
        switch (segmentType) {
          case 'productType':
            return allSegmentValues.includes(d.productType || '')
          case 'bladeMaterial':
            return allSegmentValues.includes(d.bladeMaterial || '')
          case 'handleLength':
            return allSegmentValues.includes(d.handleLength || '')
          case 'application':
            return allSegmentValues.includes(d.application || '')
          case 'endUser':
            return allSegmentValues.includes(d.endUser || '')
          case 'distributionChannelType':
            return allSegmentValues.includes(d.distributionChannelType || '')
          default:
            return true
        }
      })
    }
    
    return filtered
  }, [data, attractivenessFilters])

  // Bubble Chart Data (Market Attractiveness) - based on filters
  const bubbleChartData = useMemo(() => {
    // Helper function to generate consistent but varied incremental opportunity based on entity name
    const getRandomizedOpportunity = (entityName: string, isSegment: boolean): number => {
      // Create a simple hash from entity name for consistency
      let hash = 0
      for (let i = 0; i < entityName.length; i++) {
        hash = ((hash << 5) - hash) + entityName.charCodeAt(i)
        hash = hash & hash // Convert to 32-bit integer
      }
      
      // Use hash to generate a consistent random value between 250 and 650
      // This ensures same entity always gets same value, but different entities get different values
      const normalizedHash = Math.abs(hash) % 400 // 0-399
      const baseValue = 250 + normalizedHash // 250-649
      
      // Add some variation: multiply by a factor between 0.9 and 1.3 to get values like 300, 560, 490
      const variation = 0.9 + (Math.abs(hash * 11) % 40) / 100 // 0.9-1.3
      const finalValue = Math.round(baseValue * variation)
      
      // Ensure value is in reasonable range (250-650)
      return Math.max(250, Math.min(650, finalValue))
    }
    
    const segmentType = attractivenessFilters.segmentType
    const segmentValues = attractivenessFilters.segmentValues
    
    // Determine grouping: by sub-segments if segment type is selected, otherwise by region
    let entityDataMap = new Map<string, {
      values: number[]
      volumes: number[]
      years: number[]
    }>()
    
    if (segmentType === 'productType') {
      // Special handling for Product Type
      const hierarchy = getProductTypeHierarchy()
      const mainCategories = hierarchy.map(item => item.mainCategory)
      
      if (segmentValues.length === 0) {
        // No specific selection - show all 5 main categories as bubbles
        // Aggregate data for all children of each main category (exclude parent itself)
        mainCategories.forEach(mainCategory => {
          const children = hierarchy.find(item => item.mainCategory === mainCategory)?.subCategories || []
          const childProductTypes = children.map(child => `${mainCategory} - ${child}`)
          
          filteredAttractivenessData.forEach(d => {
            const productType = d.productType || ''
            // Only include children's data, NOT the parent itself
            if (childProductTypes.includes(productType)) {
              if (!entityDataMap.has(mainCategory)) {
                entityDataMap.set(mainCategory, { values: [], volumes: [], years: [] })
              }
              
              const entityData = entityDataMap.get(mainCategory)!
              const value = (d.marketValueUsd || 0) / 1000
              entityData.values.push(value)
              entityData.volumes.push(d.volumeUnits || 0)
              entityData.years.push(d.year)
            }
          })
        })
      } else {
        // Specific product types selected
        // Check if any selected values are main categories (parents)
        const selectedParents = segmentValues.filter(val => mainCategories.includes(val))
        const selectedChildren = segmentValues.filter(val => !mainCategories.includes(val))
        
        if (selectedParents.length > 0) {
          // Show children of selected parents, NOT the parents themselves
          selectedParents.forEach(parent => {
            const children = hierarchy.find(item => item.mainCategory === parent)?.subCategories || []
            const childProductTypes = children.map(child => `${parent} - ${child}`)
            
            childProductTypes.forEach(childProductType => {
              filteredAttractivenessData.forEach(d => {
                const productType = d.productType || ''
                if (productType === childProductType) {
                  if (!entityDataMap.has(childProductType)) {
                    entityDataMap.set(childProductType, { values: [], volumes: [], years: [] })
                  }
                  
                  const entityData = entityDataMap.get(childProductType)!
                  const value = (d.marketValueUsd || 0) / 1000
                  entityData.values.push(value)
                  entityData.volumes.push(d.volumeUnits || 0)
                  entityData.years.push(d.year)
                }
              })
            })
          })
        }
        
        // Also include directly selected children (if any)
        if (selectedChildren.length > 0) {
          selectedChildren.forEach(childProductType => {
            filteredAttractivenessData.forEach(d => {
              const productType = d.productType || ''
              if (productType === childProductType) {
                if (!entityDataMap.has(childProductType)) {
                  entityDataMap.set(childProductType, { values: [], volumes: [], years: [] })
                }
                
                const entityData = entityDataMap.get(childProductType)!
                const value = (d.marketValueUsd || 0) / 1000
                entityData.values.push(value)
                entityData.volumes.push(d.volumeUnits || 0)
                entityData.years.push(d.year)
              }
            })
          })
        }
      }
    } else if (segmentType === 'distributionChannelType') {
      // Special handling for Sales Channel
      const hierarchy = getSalesChannelHierarchy()
      const mainCategories = hierarchy.map(item => item.mainCategory)
      
      // Helper function to extract all children from nested structure
      const getAllChildren = (item: any, parentPath: string = ''): string[] => {
        const children: string[] = []
        
        if (typeof item === 'string') {
          // Simple string child - format as "Parent - Child"
          children.push(parentPath ? `${parentPath} - ${item}` : item)
        } else if (item && typeof item === 'object' && item.name) {
          // Nested object with name - format as "Parent - Name"
          const currentPath = parentPath ? `${parentPath} - ${item.name}` : item.name
          
          if (item.children && Array.isArray(item.children)) {
            // Has nested children - recurse
            item.children.forEach((child: any) => {
              children.push(...getAllChildren(child, currentPath))
            })
          } else {
            // Leaf node - just the name with parent path
            children.push(currentPath)
          }
        }
        
        return children
      }
      
      if (segmentValues.length === 0) {
        // No specific selection - show all 3 main categories as bubbles
        mainCategories.forEach(mainCategory => {
          const hierarchyItem = hierarchy.find(item => item.mainCategory === mainCategory)
          if (!hierarchyItem) return
          
          // Get all children (including nested ones)
          const allChildren: string[] = []
          hierarchyItem.subCategories.forEach((sub: any) => {
            allChildren.push(...getAllChildren(sub, mainCategory))
          })
          
          filteredAttractivenessData.forEach(d => {
            const channelType = d.distributionChannelType || ''
            // Only include children's data, NOT the parent itself
            if (allChildren.includes(channelType)) {
              if (!entityDataMap.has(mainCategory)) {
                entityDataMap.set(mainCategory, { values: [], volumes: [], years: [] })
              }
              
              const entityData = entityDataMap.get(mainCategory)!
              const value = (d.marketValueUsd || 0) / 1000
              entityData.values.push(value)
              entityData.volumes.push(d.volumeUnits || 0)
              entityData.years.push(d.year)
            }
          })
        })
      } else {
        // Specific sales channels selected
        // Check if any selected values are main categories (parents)
        const selectedParents = segmentValues.filter(val => mainCategories.includes(val))
        const selectedChildren = segmentValues.filter(val => !mainCategories.includes(val))
        
        if (selectedParents.length > 0) {
          // Show children of selected parents, NOT the parents themselves
          selectedParents.forEach(parent => {
            const hierarchyItem = hierarchy.find(item => item.mainCategory === parent)
            if (!hierarchyItem) return
            
            // Get all children (including nested ones)
            const allChildren: string[] = []
            hierarchyItem.subCategories.forEach((sub: any) => {
              allChildren.push(...getAllChildren(sub, parent))
            })
            
            allChildren.forEach(childChannelType => {
              filteredAttractivenessData.forEach(d => {
                const channelType = d.distributionChannelType || ''
                if (channelType === childChannelType) {
                  if (!entityDataMap.has(childChannelType)) {
                    entityDataMap.set(childChannelType, { values: [], volumes: [], years: [] })
                  }
                  
                  const entityData = entityDataMap.get(childChannelType)!
                  const value = (d.marketValueUsd || 0) / 1000
                  entityData.values.push(value)
                  entityData.volumes.push(d.volumeUnits || 0)
                  entityData.years.push(d.year)
                }
              })
            })
          })
        }
        
        // Also include directly selected children (if any)
        if (selectedChildren.length > 0) {
          selectedChildren.forEach(childChannelType => {
            filteredAttractivenessData.forEach(d => {
              const channelType = d.distributionChannelType || ''
              if (channelType === childChannelType) {
                if (!entityDataMap.has(childChannelType)) {
                  entityDataMap.set(childChannelType, { values: [], volumes: [], years: [] })
                }
                
                const entityData = entityDataMap.get(childChannelType)!
                const value = (d.marketValueUsd || 0) / 1000
                entityData.values.push(value)
                entityData.volumes.push(d.volumeUnits || 0)
                entityData.years.push(d.year)
              }
            })
          })
        }
      }
    } else if (segmentType) {
      // Handle other segment types (bladeMaterial, handleLength, application, endUser)
      let entityKey = ''
      let getEntityValue: ((d: any) => string) | null = null
      
      switch (segmentType) {
        case 'bladeMaterial':
          getEntityValue = (d) => d.bladeMaterial || ''
          break
        case 'handleLength':
          getEntityValue = (d) => d.handleLength || ''
          break
        case 'application':
          getEntityValue = (d) => d.application || ''
          break
        case 'endUser':
          getEntityValue = (d) => d.endUser || ''
          break
      }
      
      if (getEntityValue) {
        // Get all available values for this segment type from filtered data
        const allAvailableValues = [...new Set(filteredAttractivenessData.map(getEntityValue))].filter(Boolean).sort()
        
        // Determine which values to show
        const valuesToShow = segmentValues.length > 0 
          ? segmentValues.filter(val => allAvailableValues.includes(val))
          : allAvailableValues // Show all if no specific selection
        
        // Group data by segment values
        filteredAttractivenessData.forEach(d => {
          entityKey = getEntityValue!(d)
          
          if (!entityKey || !valuesToShow.includes(entityKey)) return
          
          if (!entityDataMap.has(entityKey)) {
            entityDataMap.set(entityKey, { values: [], volumes: [], years: [] })
          }
          
          const entityData = entityDataMap.get(entityKey)!
          const value = (d.marketValueUsd || 0) / 1000 // Convert to millions
          entityData.values.push(value)
          entityData.volumes.push(d.volumeUnits || 0)
          entityData.years.push(d.year)
        })
      }
    } else {
      // Group by region (default behavior) - only India regions
    filteredAttractivenessData.forEach(d => {
      const region = d.region
      if (!region) return
      
        // Only include India regions
        const indiaRegions = ['North India', 'South India', 'East India', 'West India', 'Central India']
        if (!indiaRegions.includes(region)) return
        
        if (!entityDataMap.has(region)) {
          entityDataMap.set(region, { values: [], volumes: [], years: [] })
        }
        
        const regionData = entityDataMap.get(region)!
      const value = (d.marketValueUsd || 0) / 1000 // Convert to millions
      regionData.values.push(value)
      regionData.volumes.push(d.volumeUnits || 0)
      regionData.years.push(d.year)
    })
    }
    
    // Calculate CAGR Index and Market Share Index for each entity
    const entities = Array.from(entityDataMap.keys())
    const allEntitiesTotal = filteredAttractivenessData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0)
    
    const bubbleData = entities.map(entity => {
      const entityData = entityDataMap.get(entity)!
      
      // Calculate CAGR (Compound Annual Growth Rate) from 2025 to 2032
      const startYear = 2025
      const endYear = 2032
      const startValue = entityData.values.find((_, i) => entityData.years[i] === startYear) || 0
      const endValue = entityData.values.find((_, i) => entityData.years[i] === endYear) || 0
      
      let cagr = 0
      if (startValue > 0 && endValue > 0) {
        const years = endYear - startYear
        cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100
      }
      
      // Calculate Market Share Index (average market share across years)
      const entityTotal = entityData.values.reduce((sum, v) => sum + v, 0)
      const marketShare = allEntitiesTotal > 0 ? (entityTotal / allEntitiesTotal) * 100 : 0
      
      // Calculate Incremental Opportunity (total growth from 2025 to 2032)
      const incrementalOpportunity = endValue - startValue
      
      // Normalize to index scale (0-10) for display
      const cagrIndex = Math.min(cagr / 10, 10) // Scale CAGR to 0-10 index
      const marketShareIndex = Math.min(marketShare / 10, 10) // Scale market share to 0-10 index
      
      // Use default values if no data (only for regions)
      const defaultValues: Record<string, { cagr: number; share: number; opp: number }> = {
        'South India': { cagr: 6.0, share: 3.0, opp: 560 },
        'East India': { cagr: 2.5, share: 1.2, opp: 300 },
        'North India': { cagr: 5.0, share: 4.0, opp: 490 },
        'West India': { cagr: 4.5, share: 3.5, opp: 420 },
        'Central India': { cagr: 3.5, share: 2.5, opp: 380 },
      }
      
      const defaults = defaultValues[entity] || { cagr: 5.0, share: 5.0, opp: getRandomizedOpportunity(entity, !!segmentType) }
      
      // Use entity name as display name (sub-segment name or region name)
      const displayName = entity
      
      // Override with specific values for South India and East India (only if grouping by region)
      // Override for Offline Retail (when grouping by sales channel)
      let finalCagrIndex = cagrIndex > 0 ? cagrIndex : (segmentType ? 5.0 : defaults.cagr)
      let finalMarketShareIndex = marketShareIndex > 0 ? marketShareIndex : (segmentType ? 5.0 : defaults.share)
      
      if (!segmentType && entity === 'South India') {
        finalCagrIndex = 6.0
        finalMarketShareIndex = 3.0
      } else if (!segmentType && entity === 'East India') {
        finalCagrIndex = 2.5
        finalMarketShareIndex = 1.2
      } else if (segmentType === 'distributionChannelType' && entity === 'Offline Retail') {
        finalCagrIndex = 7.0
        finalMarketShareIndex = 9.0
      }
      
      // Use calculated incremental opportunity if available, otherwise use randomized value
      let finalIncrementalOpportunity = incrementalOpportunity
      if (finalIncrementalOpportunity <= 0) {
        if (segmentType) {
          // For segments, use randomized value based on entity name
          finalIncrementalOpportunity = getRandomizedOpportunity(entity, true)
        } else {
          // For regions, use default or randomized value
          finalIncrementalOpportunity = defaults.opp
        }
      }
      
      return {
        region: displayName,
        cagrIndex: finalCagrIndex,
        marketShareIndex: finalMarketShareIndex,
        incrementalOpportunity: finalIncrementalOpportunity,
        description: undefined,
      }
    })
    
    // Separate bubbles to prevent overlapping
    // This function ensures minimum distance between bubble centers based on their sizes
    const separateBubbleData = (data: typeof bubbleData) => {
      if (data.length <= 1) return data
      
      const separated = data.map(d => ({ ...d }))
      
      // Calculate bubble sizes (same logic as in BubbleChart component)
      const maxOpportunity = Math.max(...separated.map(d => d.incrementalOpportunity))
      const minOpportunity = Math.min(...separated.map(d => d.incrementalOpportunity))
      const sizeRange = maxOpportunity - minOpportunity
      
      const getBubbleSize = (opp: number) => {
        return sizeRange > 0
          ? 30 + ((opp - minOpportunity) / sizeRange) * 170
          : 100
      }
      
      // Minimum separation factor - ensure bubbles don't overlap
      // Convert pixel size to data coordinate units
      // Approximate: chart width ~500px, height ~350px for data range calculation
      const cagrMin = Math.min(...separated.map(d => d.cagrIndex))
      const cagrMax = Math.max(...separated.map(d => d.cagrIndex))
      const shareMin = Math.min(...separated.map(d => d.marketShareIndex))
      const shareMax = Math.max(...separated.map(d => d.marketShareIndex))
      const cagrRange = cagrMax - cagrMin || 1
      const shareRange = shareMax - shareMin || 1
      
      const estimatedChartWidth = 450
      const estimatedChartHeight = 300
      const pixelToDataX = cagrRange / estimatedChartWidth
      const pixelToDataY = shareRange / estimatedChartHeight
      const pixelToData = Math.max(pixelToDataX, pixelToDataY)
      
      const minSeparationFactor = 1.6 // 60% gap between bubbles
      const maxIterations = 200
      
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        let hasOverlap = false
        
        for (let i = 0; i < separated.length; i++) {
          for (let j = i + 1; j < separated.length; j++) {
            const bubble1 = separated[i]
            const bubble2 = separated[j]
            
            const dx = bubble2.cagrIndex - bubble1.cagrIndex
            const dy = bubble2.marketShareIndex - bubble1.marketShareIndex
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            // Get bubble sizes
            const size1 = getBubbleSize(bubble1.incrementalOpportunity)
            const size2 = getBubbleSize(bubble2.incrementalOpportunity)
            
            // Convert radii to data coordinates
            const radius1Data = (size1 / 2) * pixelToData
            const radius2Data = (size2 / 2) * pixelToData
            const requiredDistance = (radius1Data + radius2Data) * minSeparationFactor
            
            if (distance < requiredDistance && distance > 0.0001) {
              hasOverlap = true
              
              // Calculate separation
              const overlap = requiredDistance - distance
              const damping = 0.5
              const separationAmount = overlap * damping
              
              // Unit vector
              const unitX = dx / distance
              const unitY = dy / distance
              
              // Move bubbles apart (smaller moves more)
              const totalSize = size1 + size2
              const moveRatio1 = size2 / totalSize
              const moveRatio2 = size1 / totalSize
              
              bubble1.cagrIndex -= unitX * separationAmount * moveRatio1
              bubble1.marketShareIndex -= unitY * separationAmount * moveRatio1
              bubble2.cagrIndex += unitX * separationAmount * moveRatio2
              bubble2.marketShareIndex += unitY * separationAmount * moveRatio2
              
              // Keep within reasonable bounds
              bubble1.cagrIndex = Math.max(0, Math.min(10, bubble1.cagrIndex))
              bubble1.marketShareIndex = Math.max(0, Math.min(10, bubble1.marketShareIndex))
              bubble2.cagrIndex = Math.max(0, Math.min(10, bubble2.cagrIndex))
              bubble2.marketShareIndex = Math.max(0, Math.min(10, bubble2.marketShareIndex))
            } else if (distance === 0 || (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001)) {
              // Handle exact overlap
              hasOverlap = true
              const overlapSize1 = getBubbleSize(bubble1.incrementalOpportunity)
              const overlapSize2 = getBubbleSize(bubble2.incrementalOpportunity)
              const avgRadius = ((overlapSize1 + overlapSize2) / 4) * pixelToData
              const pushDistance = avgRadius * minSeparationFactor * 0.5
              const angle = Math.random() * Math.PI * 2
              
              bubble1.cagrIndex -= Math.cos(angle) * pushDistance
              bubble1.marketShareIndex -= Math.sin(angle) * pushDistance
              bubble2.cagrIndex += Math.cos(angle) * pushDistance
              bubble2.marketShareIndex += Math.sin(angle) * pushDistance
              
              bubble1.cagrIndex = Math.max(0, Math.min(10, bubble1.cagrIndex))
              bubble1.marketShareIndex = Math.max(0, Math.min(10, bubble1.marketShareIndex))
              bubble2.cagrIndex = Math.max(0, Math.min(10, bubble2.cagrIndex))
              bubble2.marketShareIndex = Math.max(0, Math.min(10, bubble2.marketShareIndex))
            }
          }
        }
        
        if (!hasOverlap) break
      }
      
      return separated
    }
    
    // Apply separation to bubble data
    // If no entities in filtered data, return default India regions (also separated)
    if (bubbleData.length === 0 && !segmentType) {
      const defaultData = [
        {
          region: 'North India',
          cagrIndex: 5.0,
          marketShareIndex: 4.0,
          incrementalOpportunity: 490,
          description: undefined,
        },
        {
          region: 'South India',
          cagrIndex: 6.0,
          marketShareIndex: 3.0,
          incrementalOpportunity: 560,
          description: undefined,
        },
        {
          region: 'East India',
          cagrIndex: 2.5,
          marketShareIndex: 1.2,
          incrementalOpportunity: 300,
          description: undefined,
        },
        {
          region: 'West India',
          cagrIndex: 4.5,
          marketShareIndex: 3.5,
          incrementalOpportunity: 420,
          description: undefined,
        },
        {
          region: 'Central India',
          cagrIndex: 3.5,
          marketShareIndex: 2.5,
          incrementalOpportunity: 380,
          description: undefined,
        },
      ]
      return separateBubbleData(defaultData)
    }
    
    // Return separated bubble data
    return separateBubbleData(bubbleData)
  }, [filteredAttractivenessData, attractivenessFilters.segmentType, attractivenessFilters.segmentValues])

  // Get unique options for YoY filters
  const yoyFilterOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        regions: [],
        productTypes: [],
        countries: [],
        countryOptions: [], // Options with region names
      }
    }
    
    const regionSet = new Set<string>()
    const productTypeSet = new Set<string>()
    const countryRegionMap = new Map<string, string>() // country -> region mapping
    
    data.forEach(d => {
      if (d.region) regionSet.add(d.region)
      if (d.productType) productTypeSet.add(d.productType)
      if (d.country && d.region) {
        countryRegionMap.set(d.country, d.region)
      }
    })
    
    // Filter countries based on selected regions
    let availableCountries = Array.from(countryRegionMap.keys())
    if (yoyFilters.region.length > 0) {
      availableCountries = availableCountries.filter(country => {
        const countryRegion = countryRegionMap.get(country)
        return countryRegion && yoyFilters.region.includes(countryRegion)
      })
    }
    
    // Create country options with region names
    const countryOptions = availableCountries
      .sort()
      .map(country => {
        const region = countryRegionMap.get(country) || ''
        return {
          value: country,
          label: `${country} (${region})`
        }
      })
    
    return {
      regions: Array.from(regionSet).sort(),
      productTypes: Array.from(productTypeSet).sort(),
      countries: availableCountries.sort(),
      countryOptions: countryOptions,
    }
  }, [data, yoyFilters.region])

  // Filter data for YoY/CAGR chart
  const filteredYoyData = useMemo(() => {
    let filtered = [...data]
    
    if (yoyFilters.region.length > 0) {
      filtered = filtered.filter(d => yoyFilters.region.includes(d.region))
    }
    
    // Filter by selected segment type and values
    if (yoyFilters.segmentType && yoyFilters.segmentValues.length > 0) {
      const segmentType = yoyFilters.segmentType
      const segmentValues = yoyFilters.segmentValues
      
      // Get all sub-elements for hierarchical segments
      let allSegmentValues = [...segmentValues]
      
      // For Product Type, expand hierarchical values to include all sub-items
      if (segmentType === 'productType') {
        const hierarchy = getProductTypeHierarchy()
        const expandedValues = new Set<string>(segmentValues)
        
        // Recursively find all children of selected items
        const findChildren = (items: any[]) => {
          items.forEach(item => {
            if (segmentValues.includes(item.value)) {
              if (item.children) {
                item.children.forEach((child: any) => {
                  expandedValues.add(child.value)
                  if (child.children) {
                    findChildren(child.children)
                  }
                })
              }
            } else if (item.children) {
              findChildren(item.children)
            }
          })
        }
        findChildren(hierarchy)
        allSegmentValues = Array.from(expandedValues)
      }
      
      // For Sales Channel, expand hierarchical values
      if (segmentType === 'distributionChannelType') {
        const hierarchy = getSalesChannelHierarchy()
        const expandedValues = new Set<string>(segmentValues)
        
        const findChildren = (items: any[]) => {
          items.forEach(item => {
            if (segmentValues.includes(item.value)) {
              if (item.children) {
                item.children.forEach((child: any) => {
                  expandedValues.add(child.value)
                  if (child.children) {
                    findChildren(child.children)
                  }
                })
              }
            } else if (item.children) {
              findChildren(item.children)
            }
          })
        }
        findChildren(hierarchy)
        allSegmentValues = Array.from(expandedValues)
      }
      
      // Apply filter based on segment type
      filtered = filtered.filter(d => {
        switch (segmentType) {
          case 'productType':
            return allSegmentValues.includes(d.productType || '')
          case 'bladeMaterial':
            return allSegmentValues.includes(d.bladeMaterial || '')
          case 'handleLength':
            return allSegmentValues.includes(d.handleLength || '')
          case 'application':
            return allSegmentValues.includes(d.application || '')
          case 'endUser':
            return allSegmentValues.includes(d.endUser || '')
          case 'distributionChannelType':
            return allSegmentValues.includes(d.distributionChannelType || '')
          default:
            return true
        }
      })
    }
    
    return filtered
  }, [data, yoyFilters])

  // YoY/CAGR Chart Data - Generate data based on segment or region
  const yoyCagrDataByEntity = useMemo(() => {
    // If segment type is selected, create ONE chart with lines for each segment value
    if (yoyFilters.segmentType) {
      const segmentType = yoyFilters.segmentType
      
      // Get segment values - if none selected, get all available values for this segment type
      let segmentValues = yoyFilters.segmentValues.length > 0 
        ? yoyFilters.segmentValues 
        : []
      
      // Get all segment values to display (handles hierarchical segments)
      let allSegmentValues: string[] = []
      let parentToChildrenMap = new Map<string, string[]>() // Map parent to its children
      
      // Handle hierarchical segments (Product Type and Sales Channel)
      if (segmentType === 'productType') {
        const hierarchy = getProductTypeHierarchy()
        
        // Build parent-to-children map
        hierarchy.forEach(item => {
          parentToChildrenMap.set(item.mainCategory, item.subCategories)
        })
        
        // If no segment values selected, show only top-level parents
        if (segmentValues.length === 0) {
          allSegmentValues = hierarchy.map(item => item.mainCategory)
        } else {
          // Check if any selected values are parents
          const selectedParents = segmentValues.filter(val => parentToChildrenMap.has(val))
          
          if (selectedParents.length > 0) {
            // If parents are selected, show only their children (not the parents themselves)
            const childrenSet = new Set<string>()
            selectedParents.forEach(parent => {
              const children = parentToChildrenMap.get(parent) || []
              children.forEach(child => childrenSet.add(child))
            })
            // Also include any selected values that are not parents (leaf nodes)
            segmentValues.forEach(val => {
              if (!parentToChildrenMap.has(val)) {
                childrenSet.add(val)
              }
            })
            allSegmentValues = Array.from(childrenSet)
          } else {
            // Only leaf nodes selected, use them as is
            allSegmentValues = segmentValues
          }
        }
      } else if (segmentType === 'distributionChannelType') {
        const hierarchy = getSalesChannelHierarchy()
        
        // Build parent-to-children map (handle nested structure)
        const extractChildren = (subCategories: (string | { name: string; children?: string[] })[]): string[] => {
          const children: string[] = []
          subCategories.forEach(sub => {
            if (typeof sub === 'string') {
              children.push(sub)
            } else {
              children.push(sub.name)
              if (sub.children) {
                children.push(...sub.children)
              }
            }
          })
          return children
        }
        
        hierarchy.forEach(item => {
          const children = extractChildren(item.subCategories)
          parentToChildrenMap.set(item.mainCategory, children)
        })
        
        // If no segment values selected, show only top-level parents
        if (segmentValues.length === 0) {
          allSegmentValues = hierarchy.map(item => item.mainCategory)
        } else {
          // Check if any selected values are parents
          const selectedParents = segmentValues.filter(val => parentToChildrenMap.has(val))
          
          if (selectedParents.length > 0) {
            // If parents are selected, show only their children (not the parents themselves)
            const childrenSet = new Set<string>()
            selectedParents.forEach(parent => {
              const children = parentToChildrenMap.get(parent) || []
              children.forEach(child => childrenSet.add(child))
            })
            // Also include any selected values that are not parents (leaf nodes)
            segmentValues.forEach(val => {
              if (!parentToChildrenMap.has(val)) {
                childrenSet.add(val)
              }
            })
            allSegmentValues = Array.from(childrenSet)
          } else {
            // Only leaf nodes selected, use them as is
            allSegmentValues = segmentValues
          }
        }
      } else {
        // Non-hierarchical segments - if no values selected, get all available from data
        if (segmentValues.length === 0) {
          const segmentValueSet = new Set<string>()
          filteredYoyData.forEach(d => {
            let value: string | null = null
            switch (segmentType) {
              case 'bladeMaterial': value = d.bladeMaterial; break
              case 'handleLength': value = d.handleLength; break
              case 'application': value = d.application; break
              case 'endUser': value = d.endUser; break
            }
            if (value) segmentValueSet.add(value)
          })
          allSegmentValues = Array.from(segmentValueSet)
        } else {
          allSegmentValues = segmentValues
        }
      }
      
      if (allSegmentValues.length === 0) {
        return []
      }
      
      // Get segment field name
      const getSegmentField = (d: any) => {
        switch (segmentType) {
          case 'productType': return d.productType
          case 'bladeMaterial': return d.bladeMaterial
          case 'handleLength': return d.handleLength
          case 'application': return d.application
          case 'endUser': return d.endUser
          case 'distributionChannelType': return d.distributionChannelType
          default: return null
        }
      }
      
      // Get all unique years from filtered data
      const yearSet = new Set<number>()
      filteredYoyData.forEach(d => {
        const fieldValue = getSegmentField(d)
        if (!fieldValue) return
        
        // Check if this data point belongs to any of the segment values to display
        allSegmentValues.forEach(segmentValue => {
          const isParent = parentToChildrenMap.has(segmentValue)
          
          if (isParent && (segmentType === 'productType' || segmentType === 'distributionChannelType')) {
            // Check if it's the parent itself or a child of the parent
            if (fieldValue === segmentValue) {
              yearSet.add(d.year)
              return
            }
            
            const children = parentToChildrenMap.get(segmentValue) || []
            const prefix = `${segmentValue} - `
            if (fieldValue.startsWith(prefix)) {
              const childPart = fieldValue.substring(prefix.length)
              if (children.includes(childPart)) {
                yearSet.add(d.year)
                return
              }
            }
            
            if (children.includes(fieldValue)) {
              yearSet.add(d.year)
              return
            }
          } else {
            // Leaf node - check for exact match or "Parent - Child" format
            if (fieldValue === segmentValue) {
              yearSet.add(d.year)
              return
            }
            
            if (fieldValue.includes(' - ')) {
              const parts = fieldValue.split(' - ')
              const childPart = parts[parts.length - 1]
              if (childPart === segmentValue) {
                yearSet.add(d.year)
                return
              }
            }
          }
        })
      })
      const years = Array.from(yearSet).sort()
      
      if (years.length < 2) {
        return []
      }
      
      // Generate data for each segment value
      const segmentDataMap = new Map<string, Array<{ year: string, yoy: number, cagr: number }>>()
      
      allSegmentValues.forEach(segmentValue => {
        // Check if this is a parent category (for hierarchical segments)
        const isParent = parentToChildrenMap.has(segmentValue)
        let segmentFilteredData: typeof filteredYoyData = []
        
        if (isParent && (segmentType === 'productType' || segmentType === 'distributionChannelType')) {
          // If it's a parent, aggregate data from all its children
          // Data format is "Parent - Child" or just "Parent" for parent categories
          const children = parentToChildrenMap.get(segmentValue) || []
          segmentFilteredData = filteredYoyData.filter(d => {
            const fieldValue = getSegmentField(d)
            if (!fieldValue) return false
            
            // Check if it's the parent itself (exact match)
            if (fieldValue === segmentValue) return true
            
            // Check if it starts with "Parent - " and the child part matches any child
            const prefix = `${segmentValue} - `
            if (fieldValue.startsWith(prefix)) {
              const childPart = fieldValue.substring(prefix.length).trim()
              // Check exact match or if any child is contained in the childPart
              return children.some(child => {
                const trimmedChild = child.trim()
                return childPart === trimmedChild || childPart.includes(trimmedChild) || trimmedChild.includes(childPart)
              })
            }
            
            // Also check if it's a direct child match (for cases where data might just have child name)
            return children.some(child => fieldValue === child.trim() || fieldValue.includes(child.trim()))
          })
        } else {
          // If it's a leaf node, filter by the segment value directly
          // Also check if it's in the format "Parent - Child" where Child matches
          segmentFilteredData = filteredYoyData.filter(d => {
            const fieldValue = getSegmentField(d)
            if (!fieldValue) return false
            
            // Exact match
            if (fieldValue === segmentValue) return true
            
            // Check if it's in "Parent - Child" format where Child matches
            if (fieldValue.includes(' - ')) {
              const parts = fieldValue.split(' - ')
              const childPart = parts[parts.length - 1]
              return childPart === segmentValue
            }
            
            return false
          })
        }
        
        // Group data by year
        const yearDataMap = new Map<number, number>()
        segmentFilteredData.forEach(d => {
          const year = d.year
          const value = (d.marketValueUsd || 0) / 1000 // Convert to millions
          yearDataMap.set(year, (yearDataMap.get(year) || 0) + value)
        })
        
        // Calculate YoY and CAGR for each year
        const chartData = years.map((year, index) => {
          const currentValue = yearDataMap.get(year) || 0
          
          // Calculate YoY
          let yoy = 0
          if (index > 0) {
            const previousYear = years[index - 1]
            const previousValue = yearDataMap.get(previousYear) || 0
            if (previousValue > 0) {
              yoy = ((currentValue - previousValue) / previousValue) * 100
            }
          }
          
          // Calculate CAGR
          let cagr = 0
          if (index > 0) {
            const firstYear = years[0]
            const firstValue = yearDataMap.get(firstYear) || 0
            if (firstValue > 0 && currentValue > 0) {
              const yearsDiff = year - firstYear
              if (yearsDiff > 0) {
                cagr = (Math.pow(currentValue / firstValue, 1 / yearsDiff) - 1) * 100
              }
            }
          }
          
          return {
            year: String(year),
            yoy: yoy,
            cagr: cagr,
          }
        })
        
        segmentDataMap.set(segmentValue, chartData)
      })
      
      // Transform data to have one object per year with all segment values as properties
      const transformedData: Array<Record<string, any>> = []
      
      years.forEach(year => {
        const yearData: Record<string, any> = { year: String(year) }
        
        allSegmentValues.forEach(segmentValue => {
          const segmentData = segmentDataMap.get(segmentValue)
          if (segmentData) {
            const yearEntry = segmentData.find(d => d.year === String(year))
            if (yearEntry) {
              yearData[`${segmentValue}_yoy`] = yearEntry.yoy
              yearData[`${segmentValue}_cagr`] = yearEntry.cagr
            } else {
              yearData[`${segmentValue}_yoy`] = 0
              yearData[`${segmentValue}_cagr`] = 0
            }
          }
        })
        
        transformedData.push(yearData)
      })
      
      // Return ONE chart with all segment values as lines
      return [{
        label: segmentType === 'productType' ? 'By Product Type' :
               segmentType === 'bladeMaterial' ? 'By Product Form' :
               segmentType === 'handleLength' ? 'By Price Range' :
               segmentType === 'application' ? 'By Age Group' :
               segmentType === 'endUser' ? 'By Profession' :
               segmentType === 'distributionChannelType' ? 'By Sales Channel' :
               'By Segment',
        data: transformedData,
        segmentKeys: allSegmentValues // Store segment keys for rendering multiple lines
      }]
    }
    
    // If no segment selected, show separate charts for each region (original behavior)
    const entities: Array<{ type: 'region', name: string, label: string }> = []
    
    if (yoyFilters.region.length > 0) {
      yoyFilters.region.forEach(region => {
        entities.push({
          type: 'region',
          name: region,
          label: region
        })
      })
    } else {
      return []
    }
    
    // Generate data for each entity
    const entityDataMap = new Map<string, Array<{ year: string, yoy: number, cagr: number }>>()
    
    entities.forEach(entity => {
      // Filter data for this specific region
      const entityFilteredData = filteredYoyData.filter(d => d.region === entity.name)
      
      // Group data by year for this entity (no summation across entities)
      const yearDataMap = new Map<number, number>()
      
      entityFilteredData.forEach(d => {
        const year = d.year
        const value = (d.marketValueUsd || 0) / 1000 // Convert to millions
        yearDataMap.set(year, (yearDataMap.get(year) || 0) + value)
      })
      
      // Sort years
      const years = Array.from(yearDataMap.keys()).sort()
      
      if (years.length < 2) {
        // Not enough data for YoY/CAGR calculation
        return
      }
      
      // Calculate YoY and CAGR for each year
      const chartData = years.map((year, index) => {
        const currentValue = yearDataMap.get(year) || 0
        
        // Calculate YoY (Year-over-Year) growth
        let yoy = 0
        if (index > 0) {
          const previousYear = years[index - 1]
          const previousValue = yearDataMap.get(previousYear) || 0
          if (previousValue > 0) {
            yoy = ((currentValue - previousValue) / previousValue) * 100
          }
        }
        
        // Calculate CAGR from first year to current year
        let cagr = 0
        if (index > 0) {
          const firstYear = years[0]
          const firstValue = yearDataMap.get(firstYear) || 0
          if (firstValue > 0 && currentValue > 0) {
            const yearsDiff = year - firstYear
            if (yearsDiff > 0) {
              cagr = (Math.pow(currentValue / firstValue, 1 / yearsDiff) - 1) * 100
            }
          }
        }
        
        return {
          year: String(year),
          yoy: yoy,
          cagr: cagr,
        }
      })
      
      entityDataMap.set(entity.label, chartData)
    })
    
    return Array.from(entityDataMap.entries()).map(([label, data]) => ({
      label,
      data
    }))
  }, [filteredYoyData, yoyFilters.region, yoyFilters.segmentType, yoyFilters.segmentValues])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading market analysis data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('Home')}
          className="flex items-center gap-2 px-5 py-2.5 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <InfoTooltip content="• Provides insights into market size and volume analysis\n• Analyze data by market segments: Product Type, Blade Material, Handle Length, Application, End User\n• Use filters to explore market trends\n• Charts show market size (US$ Million) or volume (Units) by selected segments">
          <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 cursor-help">
            Market Analysis
          </h1>
        </InfoTooltip>
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">
          Market Analysis By Segments and Years
        </p>
      </motion.div>

      {!data || data.length === 0 ? (
        <div className={`p-8 rounded-2xl shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
          <div className="text-center py-12">
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mb-4">
              No data available. Please check the data source.
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              If this issue persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs Section */}
          <div className={`p-6 rounded-2xl mb-6 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
            <div className="flex gap-4 border-b-2 border-gray-300 dark:border-navy-light">
              <button
                onClick={() => setActiveTab('standard')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'standard'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Market Size
                {activeTab === 'standard' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('incremental')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'incremental'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Incremental Opportunity
                {activeTab === 'incremental' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('attractiveness')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'attractiveness'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Market Attractiveness
                {activeTab === 'attractiveness' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('yoy')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'yoy'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Y-o-Y / CAGR Analysis
                {activeTab === 'yoy' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
            </div>
          </div>

          <DemoNotice />

          {/* Filters Section - Only for Standard Tab */}
          {activeTab === 'standard' && (
          <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  Filter Data
                </h3>
              </div>
              <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                Filter market data by various criteria.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FilterDropdown
                label="Year"
                value={filters.year.map(y => String(y))}
                onChange={(value) => setFilters({ ...filters, year: (value as string[]).map(v => Number(v)) })}
                options={uniqueOptions.years ? uniqueOptions.years.map(y => String(y)) : []}
              />
              <FilterDropdown
                label="By Region"
                value={filters.country}
                onChange={(value) => setFilters({ ...filters, country: value as string[] })}
                options={uniqueOptions.countries || []}
              />
              <HierarchicalFilterDropdown
                label="By Product Type"
                value={filters.productType}
                onChange={(value) => setFilters({ ...filters, productType: value as string[] })}
                hierarchy={getProductTypeHierarchy()}
              />
              <FilterDropdown
                label="By Product Form"
                value={filters.bladeMaterial}
                onChange={(value) => setFilters({ ...filters, bladeMaterial: value as string[] })}
                options={uniqueOptions.bladeMaterials}
              />
              <FilterDropdown
                label="By Price Range"
                value={filters.handleLength}
                onChange={(value) => setFilters({ ...filters, handleLength: value as string[] })}
                options={uniqueOptions.handleLengths}
              />
              <FilterDropdown
                label="By Age Group"
                value={filters.application}
                onChange={(value) => setFilters({ ...filters, application: value as string[] })}
                options={uniqueOptions.applications}
              />
              <FilterDropdown
                label="By Profession"
                value={filters.endUser}
                onChange={(value) => setFilters({ ...filters, endUser: value as string[] })}
                options={uniqueOptions.endUsers || []}
              />
              <NestedHierarchicalFilterDropdown
                label="By Sales Channel"
                value={filters.distributionChannelType}
                onChange={(value) => setFilters({ ...filters, distributionChannelType: value as string[] })}
                hierarchy={getSalesChannelHierarchy()}
              />
            </div>

            {/* Active Filters Display */}
            {(filters.year.length > 0 || filters.productType.length > 0 || filters.country.length > 0) && (
              <div className="mt-6 pt-6 border-t-2 border-gray-300 dark:border-navy-light">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-navy-dark' : 'bg-blue-50'}`}>
                  <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                    Currently Viewing:
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Year:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.year.length > 0 ? filters.year.join(', ') : 'All Years'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Product Type:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.productType.length > 0 ? filters.productType.join(', ') : 'All'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Region:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.country.length > 0 ? filters.country.join(', ') : 'All Regions'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Evaluation:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.marketEvaluation}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Tab Content */}
          {activeTab === 'standard' && (
            <>
              {/* KPI Cards */}
              <div className="mb-10">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Key Metrics
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <StatBox
                      title={kpis.totalValue}
                      subtitle={`Total ${filters.marketEvaluation === 'By Volume' ? 'Volume' : 'Market Size'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Message when filters return no data */}
              {filteredData.length === 0 && data.length > 0 && (
                <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDark ? 'bg-yellow-900/20 border-2 border-yellow-600' : 'bg-yellow-50 border-2 border-yellow-300'}`}>
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-600 dark:text-yellow-400 mt-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                        No Data Matches Your Filters
                      </h3>
                      <p className="text-yellow-700 dark:text-yellow-400">
                        The selected filters are too restrictive and return no data. Please adjust your filters (Year, Region, Product Type, etc.) to see visualizations. 
                        Try clearing some filters or selecting different options.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Graph 1: Market Size by Product Type */}
          {((analysisData.productTypeChartData.length > 0 && analysisData.productTypes && analysisData.productTypes.length > 0) || 
            (analysisData.productTypeIsStacked && analysisData.productTypeStackedData.chartData.length > 0 && analysisData.productTypeStackedData.segments.length > 0)) && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} by product type grouped by year\n• X-axis: Year\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Compare product type performance across years`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Product Type
                    </h2>
                  </InfoTooltip>
                </div>
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                  Product type performance comparison by year
                </p>
              </div>
              <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                  <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                    {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Product Type by Year
                  </h3>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {getDataLabel()}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                  {analysisData.productTypeIsStacked && analysisData.productTypeStackedData.chartData.length > 0 ? (
                    <CrossSegmentStackedBarChart
                      data={analysisData.productTypeStackedData.chartData}
                      dataKeys={analysisData.productTypeStackedData.segments}
                      xAxisLabel="Year"
                      yAxisLabel={getDataLabel()}
                      nameKey="year"
                    />
                  ) : (
                  <SegmentGroupedBarChart
                    data={analysisData.productTypeChartData}
                    segmentKeys={analysisData.productTypes}
                    xAxisLabel="Year"
                    yAxisLabel={getDataLabel()}
                  />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Share Analysis Section - Year-wise Stacked Bar Charts */}
          {((analysisData.bladeMaterialStackedData.chartData.length > 0 && analysisData.bladeMaterialStackedData.segments.length > 0) ||
            (analysisData.handleLengthStackedData.chartData.length > 0 && analysisData.handleLengthStackedData.segments.length > 0) ||
            (analysisData.applicationStackedData.chartData.length > 0 && analysisData.applicationStackedData.segments.length > 0) ||
            (analysisData.endUserStackedData.chartData.length > 0 && analysisData.endUserStackedData.segments.length > 0) ||
            (analysisData.distributionChannelTypeStackedData.chartData.length > 0 && analysisData.distributionChannelTypeStackedData.segments.length > 0) ||
            (analysisData.offlineChannelStackedData.chartData.length > 0 && analysisData.offlineChannelStackedData.segments.length > 0) ||
            (analysisData.onlineChannelStackedData.chartData.length > 0 && analysisData.onlineChannelStackedData.segments.length > 0)) && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share across different segments by year\n• Each stacked bar represents a year with segments showing the proportion\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Hover over bars to see detailed values and percentages`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} Analysis by Segments
                    </h2>
                  </InfoTooltip>
                </div>
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                  Year-wise share breakdown (no summation across years)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blade Material Stacked Bar Chart */}
                {analysisData.bladeMaterialStackedData.chartData.length > 0 && analysisData.bladeMaterialStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by product form by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Product Form Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.bladeMaterialStackedData.chartData}
                        dataKeys={analysisData.bladeMaterialStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Handle Length Stacked Bar Chart */}
                {analysisData.handleLengthStackedData.chartData.length > 0 && analysisData.handleLengthStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by price range by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Price Range Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.handleLengthStackedData.chartData}
                        dataKeys={analysisData.handleLengthStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Application Stacked Bar Chart */}
                {analysisData.applicationStackedData.chartData.length > 0 && analysisData.applicationStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by age group by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Age Group Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.applicationStackedData.chartData}
                        dataKeys={analysisData.applicationStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}



                {/* Distribution Channel Type Stacked Bar Chart */}
                {analysisData.distributionChannelTypeStackedData.chartData.length > 0 && analysisData.distributionChannelTypeStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by distribution channel type by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Distribution Channel Type Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.distributionChannelTypeStackedData.chartData}
                        dataKeys={analysisData.distributionChannelTypeStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Offline Channel Subtype Stacked Bar Chart - Only show if Offline type is selected */}
                {analysisData.offlineChannelStackedData.chartData.length > 0 && analysisData.offlineChannelStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by offline distribution channel subtypes by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Offline Channel Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.offlineChannelStackedData.chartData}
                        dataKeys={analysisData.offlineChannelStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Online Channel Subtype Stacked Bar Chart - Only show if Online type is selected */}
                {analysisData.onlineChannelStackedData.chartData.length > 0 && analysisData.onlineChannelStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by online distribution channel subtypes by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Online Channel Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.onlineChannelStackedData.chartData}
                        dataKeys={analysisData.onlineChannelStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Graph 6: Market Size by Country */}
          {analysisData.countryChartData.length > 0 && analysisData.countries && analysisData.countries.length > 0 && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} by country grouped by year\n• X-axis: Year\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Compare country performance across years`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Country by Year
                    </h2>
                  </InfoTooltip>
                </div>
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                  Country-wise breakdown grouped by year
                </p>
              </div>
              <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                  <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                    {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Country by Year
                  </h3>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {getDataLabel()}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                  <SegmentGroupedBarChart
                    data={analysisData.countryChartData}
                    segmentKeys={analysisData.countries}
                    xAxisLabel="Year"
                    yAxisLabel={getDataLabel()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Graph 9: Region Country Percentage */}
          {analysisData.regionCountryPercentageChartData.length > 0 && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} by region and country grouped by year\n• X-axis: Year - Region combinations\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : filters.marketEvaluation === 'By Value' ? 'Percentage (%)' : 'Market Size'}\n• Compare regional and country performance across years`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Region & Country
                    </h2>
                  </InfoTooltip>
                </div>
                {filters.marketEvaluation === 'By Value' && (
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Percentage distribution of countries within each region by year
                  </p>
                )}
                {filters.marketEvaluation === 'By Volume' && (
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Market volume by region and country grouped by year
                  </p>
                )}
              </div>
              <div className={`p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                  <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                    Regional Distribution
                  </h3>
                </div>
                <div className="flex-1 min-h-0 w-full">
                  <RegionCountryStackedBarChart
                    data={analysisData.regionCountryPercentageChartData}
                    dataKey="value"
                    xAxisLabel="Year"
                    yAxisLabel={filters.marketEvaluation === 'By Volume' ? 'Volume (Units)' : 'Percentage (%)'}
                    showPercentage={filters.marketEvaluation === 'By Value'}
                  />
                </div>
              </div>
            </div>
          )}
            </>
          )}

          {/* Incremental Opportunity Tab */}
          {activeTab === 'incremental' && (
            <>
              {/* Filters Section for Incremental Tab */}
              <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Filter Data
                    </h3>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                    Filter incremental opportunity data by region, product type, and country.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FilterDropdown
                    label="Region"
                    value={incrementalFilters.region}
                    onChange={(value) => setIncrementalFilters({ ...incrementalFilters, region: value as string[] })}
                    options={incrementalFilterOptions.regions}
                  />
                  <HierarchicalFilterDropdown
                    label="By Product Type"
                    value={incrementalFilters.productType}
                    onChange={(value) => setIncrementalFilters({ ...incrementalFilters, productType: value as string[] })}
                    hierarchy={getProductTypeHierarchy()}
                  />
                </div>
              </div>

              <div className="mb-20">
                <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[600px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <WaterfallChart
                      data={waterfallData.chartData}
                      xAxisLabel="Incremental $ Opportunity"
                      yAxisLabel="Market Value (US$ Mn)"
                      incrementalOpportunity={waterfallData.incrementalOpportunity}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Market Attractiveness Tab */}
          {activeTab === 'attractiveness' && (
            <>
              {/* Filters Section for Attractiveness Tab */}
              <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Filter Data
                    </h3>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                    Filter market attractiveness data by region and segment (2025-2032).
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FilterDropdown
                    label="Region"
                    value={attractivenessFilters.region}
                    onChange={(value) => setAttractivenessFilters({ ...attractivenessFilters, region: value as string[] })}
                    options={attractivenessFilterOptions.regions}
                  />
                  <div className="space-y-4">
                    <FilterDropdown
                      label="By Segment"
                      value={attractivenessFilters.segmentType || ''}
                      onChange={(value) => {
                        const selectedSegment = Array.isArray(value) ? String(value[0] || '') : String(value || '')
                        setAttractivenessFilters({ 
                          ...attractivenessFilters, 
                          segmentType: selectedSegment,
                          segmentValues: [] // Clear segment values when segment type changes
                        })
                      }}
                      options={[
                        'productType',
                        'bladeMaterial',
                        'handleLength',
                        'application',
                        'endUser',
                        'distributionChannelType',
                      ]}
                      optionLabels={{
                        'productType': 'By Product Type',
                        'bladeMaterial': 'By Product Form',
                        'handleLength': 'By Price Range',
                        'application': 'By Age Group',
                        'endUser': 'By Profession',
                        'distributionChannelType': 'By Sales Channel',
                      }}
                      multiple={false}
                    />
                    {attractivenessFilters.segmentType === 'productType' && (
                  <HierarchicalFilterDropdown
                        label=""
                        value={attractivenessFilters.segmentValues}
                        onChange={(value) => setAttractivenessFilters({ ...attractivenessFilters, segmentValues: value as string[] })}
                    hierarchy={getProductTypeHierarchy()}
                  />
                    )}
                    {attractivenessFilters.segmentType === 'bladeMaterial' && (
                      <FilterDropdown
                        label=""
                        value={attractivenessFilters.segmentValues}
                        onChange={(value) => setAttractivenessFilters({ ...attractivenessFilters, segmentValues: value as string[] })}
                        options={uniqueOptions.bladeMaterials || []}
                      />
                    )}
                    {attractivenessFilters.segmentType === 'handleLength' && (
                      <FilterDropdown
                        label=""
                        value={attractivenessFilters.segmentValues}
                        onChange={(value) => setAttractivenessFilters({ ...attractivenessFilters, segmentValues: value as string[] })}
                        options={uniqueOptions.handleLengths || []}
                      />
                    )}
                    {attractivenessFilters.segmentType === 'application' && (
                      <FilterDropdown
                        label=""
                        value={attractivenessFilters.segmentValues}
                        onChange={(value) => setAttractivenessFilters({ ...attractivenessFilters, segmentValues: value as string[] })}
                        options={uniqueOptions.applications || []}
                      />
                    )}
                    {attractivenessFilters.segmentType === 'endUser' && (
                      <FilterDropdown
                        label=""
                        value={attractivenessFilters.segmentValues}
                        onChange={(value) => setAttractivenessFilters({ ...attractivenessFilters, segmentValues: value as string[] })}
                        options={uniqueOptions.endUsers || []}
                      />
                    )}
                    {attractivenessFilters.segmentType === 'distributionChannelType' && (
                      <NestedHierarchicalFilterDropdown
                        label=""
                        value={attractivenessFilters.segmentValues}
                        onChange={(value) => setAttractivenessFilters({ ...attractivenessFilters, segmentValues: value as string[] })}
                        hierarchy={getSalesChannelHierarchy()}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-20">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <InfoTooltip content="• Shows market attractiveness by region or segment from 2025 to 2032\n• X-axis: CAGR Index (Compound Annual Growth Rate)\n• Y-axis: Market Share Index\n• Bubble size indicates incremental opportunity\n• Larger bubbles represent greater market potential">
                      <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                        Market Attractiveness, {attractivenessFilters.segmentType 
                          ? (attractivenessFilters.segmentType === 'productType' ? 'By Product Type' :
                             attractivenessFilters.segmentType === 'bladeMaterial' ? 'By Product Form' :
                             attractivenessFilters.segmentType === 'handleLength' ? 'By Price Range' :
                             attractivenessFilters.segmentType === 'application' ? 'By Age Group' :
                             attractivenessFilters.segmentType === 'endUser' ? 'By Profession' :
                             attractivenessFilters.segmentType === 'distributionChannelType' ? 'By Sales Channel' :
                             'By Segment')
                          : 'By Region'}, 2025-2032
                      </h2>
                    </InfoTooltip>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Market attractiveness analysis by CAGR and Market Share Index
                  </p>
                </div>
                <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[600px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                    <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                      {attractivenessFilters.segmentType 
                        ? (attractivenessFilters.segmentType === 'productType' ? 'By Product Type' :
                           attractivenessFilters.segmentType === 'bladeMaterial' ? 'By Product Form' :
                           attractivenessFilters.segmentType === 'handleLength' ? 'By Price Range' :
                           attractivenessFilters.segmentType === 'application' ? 'By Age Group' :
                           attractivenessFilters.segmentType === 'endUser' ? 'By Profession' :
                           attractivenessFilters.segmentType === 'distributionChannelType' ? 'By Sales Channel' :
                           'By Segment')
                        : 'By Region'}
                    </h3>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      CAGR Index vs Market Share Index
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                    <BubbleChart
                      data={bubbleChartData}
                      xAxisLabel="CAGR Index"
                      yAxisLabel="Market Share Index"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* YoY / CAGR Analysis Tab */}
          {activeTab === 'yoy' && (
            <>
              {/* Filters Section for YoY/CAGR Tab */}
              <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Filter Data
                    </h3>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                    Filter YoY and CAGR analysis data by region and segment.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FilterDropdown
                    label="Region"
                    value={yoyFilters.region}
                    onChange={(value) => {
                      const newRegions = value as string[]
                      setYoyFilters({ ...yoyFilters, region: newRegions })
                    }}
                    options={yoyFilterOptions.regions}
                  />
                  <div className="space-y-4">
                  <FilterDropdown
                      label="By Segment"
                      value={yoyFilters.segmentType || ''}
                      onChange={(value) => {
                        const selectedSegment = Array.isArray(value) ? String(value[0] || '') : String(value || '')
                        setYoyFilters({ 
                          ...yoyFilters, 
                          segmentType: selectedSegment,
                          segmentValues: [] // Clear segment values when segment type changes
                        })
                      }}
                      options={[
                        'productType',
                        'bladeMaterial',
                        'handleLength',
                        'application',
                        'endUser',
                        'distributionChannelType',
                      ]}
                      optionLabels={{
                        'productType': 'By Product Type',
                        'bladeMaterial': 'By Product Form',
                        'handleLength': 'By Price Range',
                        'application': 'By Age Group',
                        'endUser': 'By Profession',
                        'distributionChannelType': 'By Sales Channel',
                      }}
                      multiple={false}
                    />
                    {yoyFilters.segmentType === 'productType' && (
                      <HierarchicalFilterDropdown
                        label=""
                        value={yoyFilters.segmentValues}
                        onChange={(value) => setYoyFilters({ ...yoyFilters, segmentValues: value as string[] })}
                        hierarchy={getProductTypeHierarchy()}
                      />
                    )}
                    {yoyFilters.segmentType === 'bladeMaterial' && (
                  <FilterDropdown
                        label=""
                        value={yoyFilters.segmentValues}
                        onChange={(value) => setYoyFilters({ ...yoyFilters, segmentValues: value as string[] })}
                        options={uniqueOptions.bladeMaterials || []}
                      />
                    )}
                    {yoyFilters.segmentType === 'handleLength' && (
                      <FilterDropdown
                        label=""
                        value={yoyFilters.segmentValues}
                        onChange={(value) => setYoyFilters({ ...yoyFilters, segmentValues: value as string[] })}
                        options={uniqueOptions.handleLengths || []}
                      />
                    )}
                    {yoyFilters.segmentType === 'application' && (
                      <FilterDropdown
                        label=""
                        value={yoyFilters.segmentValues}
                        onChange={(value) => setYoyFilters({ ...yoyFilters, segmentValues: value as string[] })}
                        options={uniqueOptions.applications || []}
                      />
                    )}
                    {yoyFilters.segmentType === 'endUser' && (
                      <FilterDropdown
                        label=""
                        value={yoyFilters.segmentValues}
                        onChange={(value) => setYoyFilters({ ...yoyFilters, segmentValues: value as string[] })}
                        options={uniqueOptions.endUsers || []}
                      />
                    )}
                    {yoyFilters.segmentType === 'distributionChannelType' && (
                      <NestedHierarchicalFilterDropdown
                        label=""
                        value={yoyFilters.segmentValues}
                        onChange={(value) => setYoyFilters({ ...yoyFilters, segmentValues: value as string[] })}
                        hierarchy={getSalesChannelHierarchy()}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-20">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <InfoTooltip content="• Shows Year-over-Year (Y-o-Y) growth rate and Compound Annual Growth Rate (CAGR)\n• Toggle between Y-o-Y and CAGR views using the button\n• Y-o-Y shows year-to-year growth percentage\n• CAGR shows cumulative annual growth rate from the first year\n• Select regions to generate separate charts for each (no summation)\n• Use filters to analyze specific regions and segments">
                      <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                        Year-over-Year (Y-o-Y) & CAGR Analysis
                      </h2>
                    </InfoTooltip>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    {yoyFilters.segmentType
                      ? 'Growth rate analysis with toggle between Y-o-Y and CAGR metrics. One chart showing all segment values as lines.'
                      : 'Growth rate analysis with toggle between Y-o-Y and CAGR metrics. Separate charts for each selected region.'}
                  </p>
                </div>
                
                {yoyCagrDataByEntity.length === 0 ? (
                  <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="flex items-center justify-center h-[400px]">
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg">
                        {yoyFilters.segmentType
                          ? 'No data available for the selected segment. Please adjust your filters.'
                          : 'Please select at least one region to view the analysis'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {yoyCagrDataByEntity.map((entity, index) => (
                      <div key={index} className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[600px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                          <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                            {entity.label}
                          </h3>
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            Toggle between Y-o-Y and CAGR views
                          </p>
                        </div>
                        <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                          <YoYCAGRChart
                            data={entity.data as Array<{ year: string; yoy?: number; cagr?: number; [key: string]: any }>}
                            xAxisLabel="Year"
                            yAxisLabel="Growth Rate (%)"
                            segmentKeys={(entity as any).segmentKeys}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
