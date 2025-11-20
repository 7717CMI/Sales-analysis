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
  const regions = ["North India", "South India", "East India", "West India"]
  
  // Product types with hierarchical structure matching Excel
  const productTypes = [
    "Skin Care",
    "Skin Care - Serums",
    "Skin Care - Moisturizers & Creams",
    "Skin Care - Face Oils (Abhyanga / Ayurvedic oils)",
    "Skin Care - Face Wash & Cleansers",
    "Skin Care - Toners / Mists",
    "Skin Care - Sunscreen",
    "Hair Care",
    "Hair Care - Oils & Serums",
    "Hair Care - Shampoos",
    "Hair Care - Conditioners & Hair Masks",
    "Hair Care - Hair Growth & Scalp Treatments",
    "Body Care",
    "Body Care - Body Oils (Ayurvedic Abhyangsnan, Massage Oils)",
    "Body Care - Lotions & Butters",
    "Body Care - Body Wash / Scrubs",
    "Cosmetic & Beauty Enhancers",
    "Cosmetic & Beauty Enhancers - Makeup (base, eyes, lips)",
    "Cosmetic & Beauty Enhancers - Nail & Hand Care",
    "Cosmetology Kits",
    "Cosmetology Kits - Facial Kits (Anti-Aging, Hydration, Acne)",
    "Cosmetology Kits - Hair Treatment Kits",
    "Cosmetology Kits - Seasonal Wellness Kits (Festive, Bridal, Ritual-based)",
    "Cosmetology Kits - Travel + Daily Routine Kits"
  ]
  
  // Updated to Product Form instead of Blade Material
  const bladeMaterials = [
    "Oils (Ayurvedic, Tonic, Carrier & Herbal blend)",
    "Creams & Lotions",
    "Serums (water/oil-based, actives)",
    "Gels & Mousse",
    "Powders (face packs, exfoliants, ubtan)",
    "Capsules / Ampoules",
    "Bars (soap, shampoo bars)",
    "Others (Sprays & Mists, etc.)"
  ]
  
  // Updated to Price Range instead of Handle Length
  const handleLengths = ["Mass", "Premium", "Luxury"]
  
  // Updated to Age Group instead of Applications
  const applications = [
    "Gen Z (Ages 10-25)",
    "Millennials (Ages 26-41)",
    "Gen X (Ages 42-57)",
    "Baby Boomers (Ages 58+)"
  ]
  
  // Profession categories (stored in endUser field)
  const professions = [
    "Students",
    "Corporate & Office Professionals",
    "Home & Family-Centric Consumers",
    "Health, Wellness & Beauty Professionals"
  ]
  
  // Sales Channel categories (stored in distributionChannelType field) - hierarchical structure
  const salesChannels = [
    "D2C & Digital Platforms",
    "D2C & Digital Platforms - E-commerce Marketplaces (Amazon, Flipkart, etc.)",
    "D2C & Digital Platforms - Brand D2C Websites & Apps",
    "D2C & Digital Platforms - Quick Commerce Platforms",
    "D2C & Digital Platforms - Social / Influencer-led Commerce",
    "Offline Retail",
    "Offline Retail - Supermarkets / Hypermarkets",
    "Offline Retail - Beauty & Cosmetic Specialty Stores",
    "Offline Retail - Pharmacies / Drugstores",
    "Offline Retail - Neighbourhood / Convenience Stores",
    "Offline Retail - Professional & Institutional - Salons & Spa Chains",
    "Offline Retail - Professional & Institutional - Aesthetic / Dermatology Clinics",
    "Others",
    "Others - Direct Selling, MLM Networks, etc."
  ]
  
  const distributionChannelTypes = ["Offline", "Online"]
  const offlineChannels = ["Retail Stores", "Pharmacies", "Specialty Beauty Stores", "Ayurvedic Clinics"]
  const onlineChannels = ["Ecommerce Platforms", "Brand Website", "Social Commerce"]
  
  const brands = [
    "Forest Essentials", "Kama Ayurveda", "Biotique", "Himalaya", "Patanjali", 
    "Khadi Natural", "Shahnaz Husain", "Lotus Herbals", "Dabur", "Baidyanath"
  ]
  
  const companies = [
    "Forest Essentials Pvt Ltd", "Kama Ayurveda", "Biotique Bio Research", "Himalaya Wellness",
    "Patanjali Ayurved", "Khadi Natural", "Shahnaz Herbals", "Lotus Herbals",
    "Dabur India Ltd", "Baidyanath Ayurved"
  ]
  
  const countryMap: Record<string, string[]> = {
    'North India': [],
    'South India': [],
    'East India': [],
    'West India': []
  }
  
  // Product type multipliers for variation
  const productTypeMultipliers: Record<string, { price: number; volume: number; cagr: number }> = {
    'Skin Care': { price: 1.0, volume: 1.2, cagr: 1.1 },
    'Hair Care': { price: 0.9, volume: 1.3, cagr: 1.2 },
    'Body Care': { price: 0.85, volume: 1.1, cagr: 1.0 },
    'Cosmetic & Beauty Enhancers': { price: 1.3, volume: 0.9, cagr: 1.15 },
    'Cosmetology Kits': { price: 1.5, volume: 0.8, cagr: 1.3 }
  }
  
  const getProductTypeMultiplier = (productType: string) => {
    const mainCategory = productType.split(' - ')[0]
    return productTypeMultipliers[mainCategory] || { price: 1.0, volume: 1.0, cagr: 1.0 }
  }
  
  // Product Form multipliers
  const bladeMaterialMultipliers: Record<string, { price: number; volume: number }> = {
    'Oils (Ayurvedic, Tonic, Carrier & Herbal blend)': { price: 1.2, volume: 1.3 },
    'Creams & Lotions': { price: 1.0, volume: 1.2 },
    'Serums (water/oil-based, actives)': { price: 1.4, volume: 0.9 },
    'Gels & Mousse': { price: 1.1, volume: 1.0 },
    'Powders (face packs, exfoliants, ubtan)': { price: 0.9, volume: 1.1 },
    'Capsules / Ampoules': { price: 1.6, volume: 0.7 },
    'Bars (soap, shampoo bars)': { price: 0.7, volume: 1.4 },
    'Others (Sprays & Mists, etc.)': { price: 1.0, volume: 1.0 }
  }
  
  // Age Group multipliers
  const applicationMultipliers: Record<string, { volume: number; price: number }> = {
    'Gen Z (Ages 10-25)': { volume: 1.4, price: 0.9 },
    'Millennials (Ages 26-41)': { volume: 1.5, price: 1.2 },
    'Gen X (Ages 42-57)': { volume: 1.2, price: 1.3 },
    'Baby Boomers (Ages 58+)': { volume: 0.9, price: 1.4 }
  }
  
  // Distribution channel multipliers
  const distributionChannelMultipliers: Record<string, { volume: number; price: number }> = {
    'Offline': { volume: 1.3, price: 1.1 },
    'Online': { volume: 1.2, price: 0.95 }
  }
  
  // Region-specific multipliers
  const regionMultipliers: Record<string, { volume: number; marketShare: number }> = {
    'North India': { volume: 1.5, marketShare: 1.4 },
    'South India': { volume: 1.3, marketShare: 1.3 },
    'East India': { volume: 1.2, marketShare: 1.1 },
    'West India': { volume: 1.4, marketShare: 1.2 }
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
          const productMult = getProductTypeMultiplier(productType)
          
          for (const bladeMaterial of bladeMaterials) {
            const bladeMult = bladeMaterialMultipliers[bladeMaterial]
            
            for (const handleLength of handleLengths) {
              // Price Range multiplier
              const handleMult = handleLength === 'Luxury' ? 1.5 : handleLength === 'Premium' ? 1.2 : 0.8
              
              for (const application of applications) {
                const appMult = applicationMultipliers[application]
                
                // Select one random profession and sales channel instead of looping through all
                const profession = professions[Math.floor(seededRandom() * professions.length)]
                const salesChannel = salesChannels[Math.floor(seededRandom() * salesChannels.length)]
                
                // Determine distribution channel type based on sales channel
                const distributionChannelType = salesChannel.startsWith('D2C') || salesChannel.startsWith('Offline') || salesChannel.startsWith('Others') ? salesChannel : 'Online'
                const channelMult = distributionChannelMultipliers[salesChannel.includes('Offline') ? 'Offline' : 'Online']
                
                // Determine specific distribution channel
                const distributionChannel = salesChannel.includes('Offline')
                  ? offlineChannels[Math.floor(seededRandom() * offlineChannels.length)]
                  : onlineChannels[Math.floor(seededRandom() * onlineChannels.length)]
                
                const brand = brands[Math.floor(seededRandom() * brands.length)]
                const brandMult = brandPremiumMap[brand] || 1.0
                const company = companies[Math.floor(seededRandom() * companies.length)]
                
                // Apply all multipliers for variation
                const basePrice = 10 + seededRandom() * 90 // $10-$100
                const price = basePrice * productMult.price * bladeMult.price * brandMult * handleMult * (1 + (year - 2021) * 0.02)
                
                const baseVolume = 100 + seededRandom() * 900 // 100-1000 units
                const volumeUnits = Math.floor(
                  baseVolume * 
                  regionMult.volume * 
                  productMult.volume * 
                  bladeMult.volume * 
                  appMult.volume * 
                  channelMult.volume * 
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
                  bladeMaterial, // Product Form
                  handleLength, // Price Range
                  application, // Age Group
                  endUser: profession, // Profession
                  distributionChannelType: salesChannel, // Sales Channel
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

// Product type hierarchy for filters
export interface ProductTypeHierarchy {
  mainCategory: string
  subCategories: string[]
}

export const getProductTypeHierarchy = (): ProductTypeHierarchy[] => {
  return [
    {
      mainCategory: "Skin Care",
      subCategories: [
        "Serums",
        "Moisturizers & Creams",
        "Face Oils (Abhyanga / Ayurvedic oils)",
        "Face Wash & Cleansers",
        "Toners / Mists",
        "Sunscreen"
      ]
    },
    {
      mainCategory: "Hair Care",
      subCategories: [
        "Oils & Serums",
        "Shampoos",
        "Conditioners & Hair Masks",
        "Hair Growth & Scalp Treatments"
      ]
    },
    {
      mainCategory: "Body Care",
      subCategories: [
        "Body Oils (Ayurvedic Abhyangsnan, Massage Oils)",
        "Lotions & Butters",
        "Body Wash / Scrubs"
      ]
    },
    {
      mainCategory: "Cosmetic & Beauty Enhancers",
      subCategories: [
        "Makeup (base, eyes, lips)",
        "Nail & Hand Care"
      ]
    },
    {
      mainCategory: "Cosmetology Kits",
      subCategories: [
        "Facial Kits (Anti-Aging, Hydration, Acne)",
        "Hair Treatment Kits",
        "Seasonal Wellness Kits (Festive, Bridal, Ritual-based)",
        "Travel + Daily Routine Kits"
      ]
    }
  ]
}

// Nested hierarchy interface for 3-level structure
export interface NestedSubCategory {
  name: string
  children?: string[]
}

export interface NestedHierarchyItem {
  mainCategory: string
  subCategories: (string | NestedSubCategory)[]
}

export const getSalesChannelHierarchy = (): NestedHierarchyItem[] => {
  return [
    {
      mainCategory: "D2C & Digital Platforms",
      subCategories: [
        "E-commerce Marketplaces (Amazon, Flipkart, etc.)",
        "Brand D2C Websites & Apps",
        "Quick Commerce Platforms",
        "Social / Influencer-led Commerce"
      ]
    },
    {
      mainCategory: "Offline Retail",
      subCategories: [
        "Supermarkets / Hypermarkets",
        "Beauty & Cosmetic Specialty Stores",
        "Pharmacies / Drugstores",
        "Neighbourhood / Convenience Stores",
        {
          name: "Professional & Institutional",
          children: [
            "Salons & Spa Chains",
            "Aesthetic / Dermatology Clinics"
          ]
        }
      ]
    },
    {
      mainCategory: "Others",
      subCategories: [
        "Direct Selling, MLM Networks, etc."
      ]
    }
  ]
}

export type { ShovelMarketData }
