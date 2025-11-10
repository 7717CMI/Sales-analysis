interface ShovelMarketData {
  recordId: number
  year: number
  region: string
  country: string
  productType: string
  bladeMaterial: string
  handleLength: string
  application: string
  endUser: string
  distributionChannelType: string
  distributionChannel: string
  brand: string
  company: string
  price: number
  volumeUnits: number
  qty: number
  revenue: number
  marketValueUsd: number
  value: number
  marketSharePct: number
  cagr: number
  yoyGrowth: number
}

const generateComprehensiveData = (): ShovelMarketData[] => {
  const years = Array.from({ length: 15 }, (_, i) => 2021 + i)
  const regions = ["North America", "Europe", "Rest of Europe", "Asia Pacific", "Latin America", "Middle East", "Africa"]
  
  const productTypes = ["Digging Shovel", "Snow Shovel", "Trenching Shovel", "Scoop Shovel", "Others"]
  const bladeMaterials = ["Carbon Steel", "Stainless Steel", "Aluminum", "Polycarbonate", "Others"]
  const handleLengths = ["Short Handle", "Medium Handle", "Long Handle", "Adjustable Handle"]
  const applications = [
    "Construction & Infrastructure",
    "Agriculture & Landscaping",
    "Mining & Quarrying",
    "Forestry",
    "Household & Gardening",
    "Snow Removal",
    "Utility & Road Maintenance"
  ]
  const endUsers = ["Commercial/Industrial Users", "Residential Users"]
  
  const distributionChannelTypes = ["Offline", "Online"]
  const offlineChannels = ["Hardware Stores", "Specialty Garden Centers", "Agricultural Supply Stores"]
  const onlineChannels = ["Ecommerce Website", "Brand's/Company's Own Website"]
  
  const brands = [
    "Fiskars", "Bully Tools", "Razor-Back", "Truper", "Ames", 
    "Spear & Jackson", "Radius Garden", "Seymour", "Union Tools", "Garant"
  ]
  
  const companies = [
    "Fiskars Corporation", "Bully Tools Inc", "Razor-Back Tools", "Truper Herramientas",
    "Ames True Temper", "Spear & Jackson", "Radius Garden", "Seymour Manufacturing",
    "Union Tools", "Garant GP"
  ]
  
  const countryMap: Record<string, string[]> = {
    "North America": ["U.S.", "Canada"],
    "Europe": ["U.K.", "Germany", "Italy", "France", "Spain", "Russia"],
    "Rest of Europe": [],
    "Asia Pacific": ["China", "India", "Japan", "South Korea", "ASEAN", "Australia", "Rest of Asia Pacific"],
    "Latin America": ["Brazil", "Argentina", "Mexico", "Peru", "Rest of Latin America"],
    "Middle East": ["GCC", "Israel", "Rest of Middle East"],
    "Africa": ["North Africa", "Central Africa", "South Africa"]
  }
  
  // Product type multipliers for variation
  const productTypeMultipliers: Record<string, { price: number; volume: number; cagr: number }> = {
    'Digging Shovel': { price: 1.0, volume: 1.2, cagr: 1.1 },
    'Snow Shovel': { price: 0.9, volume: 1.5, cagr: 1.2 },
    'Trenching Shovel': { price: 1.2, volume: 0.8, cagr: 1.0 },
    'Scoop Shovel': { price: 0.8, volume: 1.1, cagr: 0.9 },
    'Others': { price: 1.1, volume: 0.9, cagr: 1.0 }
  }
  
  // Blade material multipliers
  const bladeMaterialMultipliers: Record<string, { price: number; volume: number }> = {
    'Carbon Steel': { price: 0.8, volume: 1.3 },
    'Stainless Steel': { price: 1.3, volume: 1.0 },
    'Aluminum': { price: 1.1, volume: 0.9 },
    'Polycarbonate': { price: 0.9, volume: 1.1 },
    'Others': { price: 1.0, volume: 1.0 }
  }
  
  // Application multipliers
  const applicationMultipliers: Record<string, { volume: number; price: number }> = {
    'Construction & Infrastructure': { volume: 1.4, price: 1.2 },
    'Agriculture & Landscaping': { volume: 1.3, price: 1.0 },
    'Mining & Quarrying': { volume: 0.7, price: 1.4 },
    'Forestry': { volume: 0.8, price: 1.1 },
    'Household & Gardening': { volume: 1.5, price: 0.8 },
    'Snow Removal': { volume: 1.2, price: 0.9 },
    'Utility & Road Maintenance': { volume: 1.0, price: 1.1 }
  }
  
  // End user multipliers
  const endUserMultipliers: Record<string, { volume: number; price: number }> = {
    'Commercial/Industrial Users': { volume: 1.2, price: 1.3 },
    'Residential Users': { volume: 1.5, price: 0.8 }
  }
  
  // Region-specific multipliers
  const regionMultipliers: Record<string, { volume: number; marketShare: number }> = {
    'North America': { volume: 1.5, marketShare: 1.4 },
    'Europe': { volume: 1.3, marketShare: 1.3 },
    'Rest of Europe': { volume: 1.2, marketShare: 1.1 },
    'Asia Pacific': { volume: 1.8, marketShare: 1.5 },
    'Latin America': { volume: 1.1, marketShare: 0.9 },
    'Middle East': { volume: 0.9, marketShare: 1.1 },
    'Africa': { volume: 1.2, marketShare: 0.8 }
  }
  
  // Brand-specific multipliers
  const brandPremiumMap: Record<string, number> = {}
  brands.forEach((brand, idx) => {
    brandPremiumMap[brand] = 0.8 + (idx % 3) * 0.4 // Creates 3 tiers: 0.8, 1.2, 1.6
  })

  const data: ShovelMarketData[] = []
  let recordId = 100000
  
  let seed = 42
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  
  for (const year of years) {
    for (const region of regions) {
      const regionMult = regionMultipliers[region]
      const countries = countryMap[region] || []
      // If no countries, use region name as country (e.g., "Rest of Europe")
      const countriesToProcess = countries.length > 0 ? countries : [region]
      
      for (const country of countriesToProcess) {
        for (const productType of productTypes) {
          const productMult = productTypeMultipliers[productType]
          
          for (const bladeMaterial of bladeMaterials) {
            const bladeMult = bladeMaterialMultipliers[bladeMaterial]
            
            for (const handleLength of handleLengths) {
              // Handle length multiplier
              const handleMult = handleLength === 'Long Handle' ? 1.1 : handleLength === 'Short Handle' ? 0.9 : 1.0
              
              for (const application of applications) {
                const appMult = applicationMultipliers[application]
                
                for (const endUser of endUsers) {
                  const userMult = endUserMultipliers[endUser]
                  
                  // Determine distribution channel type and channel
                  const isOnline = seededRandom() > 0.6 // 40% online, 60% offline
                  const distributionChannelType = isOnline ? 'Online' : 'Offline'
                  const distributionChannel = isOnline
                    ? onlineChannels[Math.floor(seededRandom() * onlineChannels.length)]
                    : offlineChannels[Math.floor(seededRandom() * offlineChannels.length)]
                  
                  const brand = brands[Math.floor(seededRandom() * brands.length)]
                  const brandMult = brandPremiumMap[brand] || 1.0
                  const company = companies[Math.floor(seededRandom() * companies.length)]
                  
                  // Apply all multipliers for variation
                  const basePrice = 10 + seededRandom() * 90 // $10-$100
                  const price = basePrice * productMult.price * bladeMult.price * brandMult * (1 + (year - 2021) * 0.02)
                  
                  const baseVolume = 100 + seededRandom() * 900 // 100-1000 units
                  const volumeUnits = Math.floor(
                    baseVolume * 
                    regionMult.volume * 
                    productMult.volume * 
                    bladeMult.volume * 
                    appMult.volume * 
                    userMult.volume * 
                    handleMult *
                    (1 + (year - 2021) * 0.05)
                  )
                  
                  const revenue = price * volumeUnits
                  const marketValueUsd = revenue * (0.9 + seededRandom() * 0.2)
                  
                  const baseMarketShare = 1 + seededRandom() * 24
                  const marketSharePct = baseMarketShare * regionMult.marketShare * brandMult
                  
                  const baseCAGR = -2 + seededRandom() * 12
                  const cagr = baseCAGR * productMult.cagr
                  const yoyGrowth = -5 + seededRandom() * 20
                  const qty = Math.floor(volumeUnits * (0.8 + seededRandom() * 0.4))
                  
                  data.push({
                    recordId,
                    year,
                    region,
                    country,
                    productType,
                    bladeMaterial,
                    handleLength,
                    application,
                    endUser,
                    distributionChannelType,
                    distributionChannel,
                    brand,
                    company,
                    price: Math.round(price * 100) / 100,
                    volumeUnits,
                    qty,
                    revenue: Math.round(revenue * 100) / 100,
                    marketValueUsd: Math.round(marketValueUsd * 100) / 100,
                    value: Math.round(marketValueUsd * 100) / 100,
                    marketSharePct: Math.round(marketSharePct * 100) / 100,
                    cagr: Math.round(cagr * 100) / 100,
                    yoyGrowth: Math.round(yoyGrowth * 100) / 100,
                  })
                  
                  recordId++
                }
              }
            }
          }
        }
      }
    }
  }
  
  return data
}

let dataCache: ShovelMarketData[] | null = null

export const getData = (): ShovelMarketData[] => {
  if (!dataCache) {
    try {
      dataCache = generateComprehensiveData()
    } catch (error) {
      dataCache = []
    }
  }
  return dataCache
}

// Function to clear cache and regenerate data (for development/testing)
export const clearDataCache = () => {
  dataCache = null
}

export interface FilterOptions {
  year?: number[]
  productType?: string[]
  bladeMaterial?: string[]
  handleLength?: string[]
  application?: string[]
  endUser?: string[]
  distributionChannelType?: string[]
  distributionChannel?: string[]
  region?: string[]
  country?: string[]
  brand?: string[]
  company?: string[]
  [key: string]: any
}

export const filterDataframe = (data: ShovelMarketData[], filters: FilterOptions): ShovelMarketData[] => {
  let filtered = [...data]
  
  for (const [field, values] of Object.entries(filters)) {
    if (values && Array.isArray(values) && values.length > 0) {
      filtered = filtered.filter(item => {
        const itemValue = item[field as keyof ShovelMarketData]
        // Handle number to string conversion for year field
        if (field === 'year' && typeof itemValue === 'number') {
          return values.map(v => String(v)).includes(String(itemValue))
        }
        return values.includes(itemValue as any)
      })
    }
  }
  
  return filtered
}

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`
  } else if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`
  } else if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K`
  }
  return Math.round(num).toLocaleString('en-US')
}

export const formatWithCommas = (num: number, decimals = 1): string => {
  const value = parseFloat(num.toFixed(decimals))
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export const addCommas = (num: number | null | undefined): string | number | null | undefined => {
  if (num === null || num === undefined || isNaN(num)) {
    return num
  }
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export type { ShovelMarketData }
