import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

interface CustomerIntelligenceProps {
  onNavigate: (page: string) => void
}

export function CustomerIntelligence({ onNavigate }: CustomerIntelligenceProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<'value' | 'volume'>('value')

  // Sample data structure matching your Excel
  const tableData = [
    {
      company: 'Company 1',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'Company 2',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'Company 3',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers', 'Cosmetology Kits']
    },
    {
      company: 'Company 4',
      productTypes: ['Skin Care', 'Hair Care', 'Body Care', 'Cosmetic & Beauty Enhancers']
    }
  ]

  const ecommercePlatforms = ['Amazon', 'Flipkart', 'Nykaa', 'Myntra', 'Purplle', 'Others']
  const quickCommercePlatforms = ['Blinkit', 'Zepto', 'Instamart (Swiggy)', 'BigBasket Now', 'Dunzo', 'Others']

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
          Company Sales Analysis
        </h1>
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">
          Sales data analysis by key cosmetics players
        </p>
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
                          className="px-4 py-3 font-medium border-r border-gray-300 dark:border-navy-light sticky left-0 z-10 bg-white dark:bg-navy-card"
                        >
                          {company.company}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm border-r border-gray-300 dark:border-navy-light">
                        {productType}
                      </td>
                      {ecommercePlatforms.map((platform) => (
                        <td key={platform} className="px-3 py-3 text-center text-sm border-r border-gray-300 dark:border-navy-light">
                          XX
                        </td>
                      ))}
                      {quickCommercePlatforms.map((platform) => (
                        <td key={platform} className="px-3 py-3 text-center text-sm border-r border-gray-300 dark:border-navy-light">
                          XX
                        </td>
                      ))}
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
                          className="px-4 py-3 font-medium border-r border-gray-300 dark:border-navy-light sticky left-0 z-10 bg-white dark:bg-navy-card"
                        >
                          {company.company}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm border-r border-gray-300 dark:border-navy-light">
                        {productType}
                      </td>
                      {ecommercePlatforms.map((platform) => (
                        <td key={platform} className="px-3 py-3 text-center text-sm border-r border-gray-300 dark:border-navy-light">
                          XX
                        </td>
                      ))}
                      {quickCommercePlatforms.map((platform) => (
                        <td key={platform} className="px-3 py-3 text-center text-sm border-r border-gray-300 dark:border-navy-light">
                          XX
                        </td>
                      ))}
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
