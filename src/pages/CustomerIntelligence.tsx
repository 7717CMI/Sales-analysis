import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { PieChart } from '../components/PieChart'
import { getChartColors } from '../utils/chartColors'

interface CustomerIntelligenceProps {
  onNavigate: (page: string) => void
}

export function CustomerIntelligence({ onNavigate }: CustomerIntelligenceProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<'value' | 'volume'>('value')

  // Helper function to generate realistic dummy data based on company and product type
  // Uses deterministic hash for consistent values
  const generateSalesData = (companyIndex: number, productType: string, platform: string, isVolume: boolean = false): number => {
    // Base multipliers for different companies (larger companies have higher sales)
    const companyMultipliers = [1.8, 1.5, 1.6, 1.2, 0.9, 0.8, 0.7, 1.4, 1.3, 1.1]
    
    // Product type multipliers (Skin Care and Hair Care typically have higher sales)
    const productTypeMultipliers: Record<string, number> = {
      'Skin Care': 1.5,
      'Hair Care': 1.3,
      'Body Care': 1.0,
      'Cosmetic & Beauty Enhancers': 0.9,
      'Cosmetology Kits': 0.7
    }
    
    // Platform multipliers (Amazon and Flipkart typically have higher sales)
    const platformMultipliers: Record<string, number> = {
      'Amazon': 1.4,
      'Flipkart': 1.2,
      'Nykaa': 1.1,
      'Myntra': 1.0,
      'Purplle': 0.8,
      'Blinkit': 0.9,
      'Zepto': 0.85,
      'Instamart (Swiggy)': 0.8,
      'BigBasket Now': 0.75,
      'Dunzo': 0.7,
      'Others': 0.6
    }
    
    // Create deterministic hash for consistent values
    const hashString = `${companyIndex}-${productType}-${platform}-${isVolume ? 'vol' : 'val'}`
    let hash = 0
    for (let i = 0; i < hashString.length; i++) {
      hash = ((hash << 5) - hash) + hashString.charCodeAt(i)
      hash = hash & hash
    }
    
    // Use hash to generate consistent random factor (0.8 to 1.2)
    const normalizedHash = Math.abs(hash) % 400
    const randomFactor = 0.8 + (normalizedHash / 400) * 0.4
    
    // Base values
    const baseValue = isVolume ? 50000 : 2500000 // Base in units for volume, INR for value
    const companyMultiplier = companyMultipliers[companyIndex] || 1.0
    const productMultiplier = productTypeMultipliers[productType] || 1.0
    const platformMultiplier = platformMultipliers[platform] || 0.6
    
    const value = baseValue * companyMultiplier * productMultiplier * platformMultiplier * randomFactor
    
    // Round appropriately
    if (isVolume) {
      return Math.round(value) // Units
    } else {
      return Math.round(value / 1000) * 1000 // Round to nearest 1000 for INR
    }
  }

  // Sample data structure with actual company names
  const tableData = [
    {
      company: "L'Oréal India (part of L'Oréal S.A.)",
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'Beiersdorf AG',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'The Estée Lauder Companies Inc.',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'Puig Group',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'Mamaearth',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'Plum Goodness',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'SUGAR Cosmetics',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'Amorepacific Corporation',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'Coty Inc.',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'Shiseido Company, Limited',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers']
    }
  ]

  const ecommercePlatforms = ['Amazon', 'Flipkart', 'Nykaa', 'Myntra', 'Purplle', 'Others']
  const quickCommercePlatforms = ['Blinkit', 'Zepto', 'Instamart (Swiggy)', 'BigBasket Now', 'Dunzo', 'Others']
  
  // Helper function to format numbers
  const formatNumber = (num: number, isVolume: boolean = false): string => {
    if (isVolume) {
      // Format as units (e.g., 45,230)
      return num.toLocaleString('en-IN')
    } else {
      // Format as INR (e.g., ₹2,45,000)
      return `₹${num.toLocaleString('en-IN')}`
    }
  }

  // Prepare data for Graph 1: Sales by Product Type (Pie Chart) - Aggregated across all companies
  const productTypeData = useMemo(() => {
    const allProductTypes = ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    const allPlatforms = [...ecommercePlatforms, ...quickCommercePlatforms]
    const isVolume = activeTab === 'volume'
    
    // Aggregate sales by product type across all companies
    const productTypeTotals: Record<string, number> = {}
    
    allProductTypes.forEach((productType) => {
      productTypeTotals[productType] = 0
    })
    
    tableData.forEach((company, companyIndex) => {
      allProductTypes.forEach((productType) => {
        if (company.productTypes.includes(productType)) {
          allPlatforms.forEach((platform) => {
            productTypeTotals[productType] += generateSalesData(
              companyIndex,
              productType,
              platform,
              isVolume
            )
          })
        }
      })
    })
    
    // Convert to array format for pie chart
    return allProductTypes.map((productType) => ({
      productType,
      value: productTypeTotals[productType]
    }))
  }, [activeTab])

  // Prepare data for Graph 2: Sales by Platform/Channel (Pie Chart) - Aggregated across all companies
  const platformChannelData = useMemo(() => {
    const allPlatforms = [...ecommercePlatforms, ...quickCommercePlatforms]
    const isVolume = activeTab === 'volume'
    
    // Aggregate sales by platform across all companies
    const platformTotals: Record<string, number> = {}
    
    allPlatforms.forEach((platform) => {
      platformTotals[platform] = 0
    })
    
    tableData.forEach((company, companyIndex) => {
      allPlatforms.forEach((platform) => {
        company.productTypes.forEach((productType) => {
          platformTotals[platform] += generateSalesData(
            companyIndex,
            productType,
            platform,
            isVolume
          )
        })
      })
    })
    
    // Convert to array format for pie chart
    return allPlatforms.map((platform) => ({
      platform,
      value: platformTotals[platform]
    }))
  }, [activeTab])

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
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
        <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3">
          Company / Brand Sales Intelligence
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('value')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'value'
              ? isDark
                ? 'bg-electric-blue text-white'
                : 'bg-electric-blue text-white'
              : isDark
              ? 'bg-navy-light text-text-secondary-dark hover:bg-navy-card'
              : 'bg-gray-200 text-text-secondary-light hover:bg-gray-300'
          }`}
        >
          Value (INR)
        </button>
        <button
          onClick={() => setActiveTab('volume')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'volume'
              ? isDark
                ? 'bg-electric-blue text-white'
                : 'bg-electric-blue text-white'
              : isDark
              ? 'bg-navy-light text-text-secondary-dark hover:bg-navy-card'
              : 'bg-gray-200 text-text-secondary-light hover:bg-gray-300'
          }`}
        >
          Volume (Units)
        </button>
      </div>

      {/* Graph 1: Sales by Product Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl shadow-xl p-6 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}
      >
        <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
          Sales by Product Type
        </h2>
        <div className="h-96">
          <PieChart
            data={productTypeData}
            dataKey="value"
            nameKey="productType"
            isVolume={activeTab === 'volume'}
            colors={getChartColors(productTypeData.length)}
          />
        </div>
      </motion.div>

      {/* Graph 2: Sales by Platform/Channel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl shadow-xl p-6 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}
      >
        <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
          Sales by Platform/Channel
        </h2>
        <div className="h-96">
          <PieChart
            data={platformChannelData}
            dataKey="value"
            nameKey="platform"
            isVolume={activeTab === 'volume'}
            colors={getChartColors(platformChannelData.length)}
          />
        </div>
      </motion.div>

      {/* Value (INR) Table */}
      {activeTab === 'value' && (
        <div className={`rounded-2xl shadow-xl overflow-hidden ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'bg-navy-light' : 'bg-gray-100'}>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-gray-300 dark:border-navy-light sticky left-0 z-10 bg-gray-100 dark:bg-navy-light">
                    Company Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-gray-300 dark:border-navy-light">
                    Product Type
                  </th>
                  <th colSpan={ecommercePlatforms.length} className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 dark:border-navy-light bg-yellow-100 dark:bg-yellow-900">
                    E-commerce
                  </th>
                  <th colSpan={quickCommercePlatforms.length} className="px-4 py-3 text-center text-sm font-semibold bg-orange-100 dark:bg-orange-900">
                    Quick Commerce
                  </th>
                </tr>
                <tr className={isDark ? 'bg-navy-light' : 'bg-gray-50'}>
                  <th className="px-4 py-2 border-r border-gray-300 dark:border-navy-light sticky left-0 z-10 bg-gray-50 dark:bg-navy-light"></th>
                  <th className="px-4 py-2 border-r border-gray-300 dark:border-navy-light"></th>
                  {ecommercePlatforms.map((platform) => (
                    <th key={platform} className="px-3 py-2 text-center text-xs font-medium border-r border-gray-300 dark:border-navy-light">
                      {platform}
                    </th>
                  ))}
                  {quickCommercePlatforms.map((platform) => (
                    <th key={platform} className="px-3 py-2 text-center text-xs font-medium border-r border-gray-300 dark:border-navy-light">
                      {platform}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((company, companyIndex) => (
                  company.productTypes.map((productType, productIndex) => (
                    <tr 
                      key={`${companyIndex}-${productIndex}`}
                      className={`border-t border-gray-200 dark:border-navy-light hover:bg-gray-50 dark:hover:bg-navy-light/50 transition-colors`}
                    >
                      {productIndex === 0 && (
                        <td 
                          rowSpan={company.productTypes.length}
                          className={`px-4 py-3 font-medium border-r border-gray-300 dark:border-navy-light sticky left-0 z-10 ${
                            isDark ? 'bg-navy-card' : 'bg-white'
                          }`}
                        >
                          {company.company}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm border-r border-gray-300 dark:border-navy-light">
                        {productType}
                      </td>
                      {ecommercePlatforms.map((platform) => {
                        const value = generateSalesData(companyIndex, productType, platform, false)
                        return (
                          <td key={platform} className="px-3 py-3 text-center text-sm border-r border-gray-300 dark:border-navy-light">
                            {formatNumber(value, false)}
                          </td>
                        )
                      })}
                      {quickCommercePlatforms.map((platform) => {
                        const value = generateSalesData(companyIndex, productType, platform, false)
                        return (
                          <td key={platform} className="px-3 py-3 text-center text-sm border-r border-gray-300 dark:border-navy-light">
                            {formatNumber(value, false)}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Volume (UNITS) Table */}
      {activeTab === 'volume' && (
        <div className={`rounded-2xl shadow-xl overflow-hidden ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'bg-navy-light' : 'bg-gray-100'}>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-gray-300 dark:border-navy-light sticky left-0 z-10 bg-gray-100 dark:bg-navy-light">
                    Company Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-gray-300 dark:border-navy-light">
                    Product Type
                  </th>
                  <th colSpan={ecommercePlatforms.length} className="px-4 py-3 text-center text-sm font-semibold border-r border-gray-300 dark:border-navy-light bg-yellow-100 dark:bg-yellow-900">
                    E-commerce
                  </th>
                  <th colSpan={quickCommercePlatforms.length} className="px-4 py-3 text-center text-sm font-semibold bg-orange-100 dark:bg-orange-900">
                    Quick Commerce
                  </th>
                </tr>
                <tr className={isDark ? 'bg-navy-light' : 'bg-gray-50'}>
                  <th className="px-4 py-2 border-r border-gray-300 dark:border-navy-light sticky left-0 z-10 bg-gray-50 dark:bg-navy-light"></th>
                  <th className="px-4 py-2 border-r border-gray-300 dark:border-navy-light"></th>
                  {ecommercePlatforms.map((platform) => (
                    <th key={platform} className="px-3 py-2 text-center text-xs font-medium border-r border-gray-300 dark:border-navy-light">
                      {platform}
                    </th>
                  ))}
                  {quickCommercePlatforms.map((platform) => (
                    <th key={platform} className="px-3 py-2 text-center text-xs font-medium border-r border-gray-300 dark:border-navy-light">
                      {platform}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((company, companyIndex) => (
                  company.productTypes.map((productType, productIndex) => (
                    <tr 
                      key={`${companyIndex}-${productIndex}`}
                      className={`border-t border-gray-200 dark:border-navy-light hover:bg-gray-50 dark:hover:bg-navy-light/50 transition-colors`}
                    >
                      {productIndex === 0 && (
                        <td 
                          rowSpan={company.productTypes.length}
                          className={`px-4 py-3 font-medium border-r border-gray-300 dark:border-navy-light sticky left-0 z-10 ${
                            isDark ? 'bg-navy-card' : 'bg-white'
                          }`}
                        >
                          {company.company}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm border-r border-gray-300 dark:border-navy-light">
                        {productType}
                      </td>
                      {ecommercePlatforms.map((platform) => {
                        const volume = generateSalesData(companyIndex, productType, platform, true)
                        return (
                          <td key={platform} className="px-3 py-3 text-center text-sm border-r border-gray-300 dark:border-navy-light">
                            {formatNumber(volume, true)}
                          </td>
                        )
                      })}
                      {quickCommercePlatforms.map((platform) => {
                        const volume = generateSalesData(companyIndex, productType, platform, true)
                        return (
                          <td key={platform} className="px-3 py-3 text-center text-sm border-r border-gray-300 dark:border-navy-light">
                            {formatNumber(volume, true)}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
