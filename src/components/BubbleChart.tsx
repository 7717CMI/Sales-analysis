import { useMemo } from 'react'
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { formatWithCommas } from '../utils/dataGenerator'

interface BubbleData {
  region: string
  cagrIndex: number
  marketShareIndex: number
  incrementalOpportunity: number
  description?: string
}

interface BubbleChartProps {
  data: BubbleData[]
  xAxisLabel?: string
  yAxisLabel?: string
}

// Color palette for bubbles - blue for largest, different colors for others
const BLUE_COLOR = '#0075FF' // Blue color for the largest bubble
const COLOR_PALETTE = [
  '#10B981', // Green
  '#F59E0B', // Amber/Orange
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
]

export function BubbleChart({ 
  data, 
  xAxisLabel = 'CAGR Index', 
  yAxisLabel = 'Market Share Index'
}: BubbleChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark">
        No data available
      </div>
    )
  }

  // Normalize bubble sizes for visualization
  const maxOpportunity = Math.max(...data.map(d => d.incrementalOpportunity))
  const minOpportunity = Math.min(...data.map(d => d.incrementalOpportunity))
  const sizeRange = maxOpportunity - minOpportunity

  // Create color map based on incremental opportunity (largest gets blue)
  const colorMap = useMemo(() => {
    const sortedData = [...data].sort((a, b) => b.incrementalOpportunity - a.incrementalOpportunity)
    const map = new Map<string, string>()
    
    sortedData.forEach((item, index) => {
      const key = `${item.region}-${item.cagrIndex}-${item.marketShareIndex}`
      const bubbleColor = index === 0 
        ? BLUE_COLOR 
        : COLOR_PALETTE[(index - 1) % COLOR_PALETTE.length]
      map.set(key, bubbleColor)
    })
    
    return map
  }, [data])

  const transformedData = useMemo(() => {
    // Sort data by incrementalOpportunity to identify the largest bubble
    const sortedData = [...data].sort((a, b) => b.incrementalOpportunity - a.incrementalOpportunity)
    
    const initialData = sortedData.map((item, index) => {
      // Scale bubble size (min 30, max 200) - Recharts uses 'z' for bubble size
      const normalizedSize = sizeRange > 0
        ? 30 + ((item.incrementalOpportunity - minOpportunity) / sizeRange) * 170
        : 100
      
      // Assign color: blue for largest (index 0), different colors for others
      const bubbleColor = index === 0 
        ? BLUE_COLOR 
        : COLOR_PALETTE[(index - 1) % COLOR_PALETTE.length]
      
      return {
        ...item,
        z: normalizedSize, // Recharts uses 'z' for bubble size
        size: normalizedSize, // Keep for custom shape
        color: bubbleColor, // Assign color to each bubble
      }
    })

    // Collision detection and avoidance algorithm
    // This ensures no two bubbles overlap by adjusting their positions
    const separateBubbles = (bubbles: typeof initialData) => {
      if (bubbles.length <= 1) return bubbles
      
      const separated = bubbles.map(b => ({ ...b }))
      const minSeparationFactor = 1.5 // Minimum separation factor (50% gap between bubbles)
      const maxIterations = 200
      const initialDamping = 0.8 // Higher initial damping for faster convergence
      const minDamping = 0.2 // Minimum damping
      
      // Calculate original data ranges (before separation) for consistent conversion
      const originalCagrMin = Math.min(...bubbles.map(d => d.cagrIndex))
      const originalCagrMax = Math.max(...bubbles.map(d => d.cagrIndex))
      const originalShareMin = Math.min(...bubbles.map(d => d.marketShareIndex))
      const originalShareMax = Math.max(...bubbles.map(d => d.marketShareIndex))
      const cagrDataRange = originalCagrMax - originalCagrMin || 1
      const shareDataRange = originalShareMax - originalShareMin || 1
      
      // Estimate chart dimensions (accounting for margins)
      // ResponsiveContainer will adjust, but we use conservative estimates
      const estimatedChartWidth = 450 // Account for margins
      const estimatedChartHeight = 300 // Account for margins
      
      // Convert pixel sizes to data coordinate units
      // Calculate conversion factors for both axes
      const pixelToDataX = cagrDataRange / estimatedChartWidth
      const pixelToDataY = shareDataRange / estimatedChartHeight
      
      // Use a more accurate approach: calculate radius in data units for each axis separately
      const getRadiusInDataUnits = (bubbleSize: number, axis: 'x' | 'y') => {
        const pixelRadius = bubbleSize / 2
        return axis === 'x' 
          ? pixelRadius * pixelToDataX 
          : pixelRadius * pixelToDataY
      }
      
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        let hasOverlap = false
        let maxOverlap = 0
        
        // Adaptive damping: start high, decrease over iterations
        const damping = Math.max(minDamping, initialDamping * (1 - iteration / maxIterations))
        
        for (let i = 0; i < separated.length; i++) {
          for (let j = i + 1; j < separated.length; j++) {
            const bubble1 = separated[i]
            const bubble2 = separated[j]
            
            // Calculate distance between bubble centers in data coordinates
            const dx = bubble2.cagrIndex - bubble1.cagrIndex
            const dy = bubble2.marketShareIndex - bubble1.marketShareIndex
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            // Calculate required separation using ellipse-based collision detection
            // This accounts for different scales on X and Y axes
            const radius1X = getRadiusInDataUnits(bubble1.size, 'x')
            const radius1Y = getRadiusInDataUnits(bubble1.size, 'y')
            const radius2X = getRadiusInDataUnits(bubble2.size, 'x')
            const radius2Y = getRadiusInDataUnits(bubble2.size, 'y')
            
            // Check if bubbles overlap using ellipse collision detection
            // Simplified: use the larger radius for each axis
            const maxRadiusX = Math.max(radius1X, radius2X)
            const maxRadiusY = Math.max(radius1Y, radius2Y)
            
            // Calculate if they overlap (using Manhattan distance approximation for ellipses)
            const requiredDistanceX = (radius1X + radius2X) * minSeparationFactor
            const requiredDistanceY = (radius1Y + radius2Y) * minSeparationFactor
            
            // Check overlap using a more conservative approach
            const overlapX = Math.max(0, requiredDistanceX - Math.abs(dx))
            const overlapY = Math.max(0, requiredDistanceY - Math.abs(dy))
            const isOverlapping = overlapX > 0 && overlapY > 0
            
            // Also check Euclidean distance for a more accurate check
            const avgRadius1 = (radius1X + radius1Y) / 2
            const avgRadius2 = (radius2X + radius2Y) / 2
            const requiredDistanceEuclidean = (avgRadius1 + avgRadius2) * minSeparationFactor
            const isOverlappingEuclidean = distance < requiredDistanceEuclidean && distance > 0.0001
            
            if (isOverlappingEuclidean || (isOverlapping && distance > 0.0001)) {
              hasOverlap = true
              
              // Calculate overlap amount
              const overlap = Math.max(
                requiredDistanceEuclidean - distance,
                Math.sqrt(overlapX * overlapX + overlapY * overlapY)
              )
              maxOverlap = Math.max(maxOverlap, overlap)
              
              // Calculate unit vector for separation direction
              const unitX = distance > 0.0001 ? dx / distance : (Math.random() - 0.5) * 2
              const unitY = distance > 0.0001 ? dy / distance : (Math.random() - 0.5) * 2
              const unitLength = Math.sqrt(unitX * unitX + unitY * unitY)
              const normalizedX = unitLength > 0 ? unitX / unitLength : 1
              const normalizedY = unitLength > 0 ? unitY / unitLength : 0
              
              // Calculate separation amount with damping
              const separationAmount = overlap * damping
              
              // Move bubbles apart - distribute movement based on size
              // Smaller bubbles move more to preserve relative positions
              const totalSize = bubble1.size + bubble2.size
              const moveRatio1 = totalSize > 0 ? bubble2.size / totalSize : 0.5
              const moveRatio2 = totalSize > 0 ? bubble1.size / totalSize : 0.5
              
              // Adjust positions
              bubble1.cagrIndex -= normalizedX * separationAmount * moveRatio1
              bubble1.marketShareIndex -= normalizedY * separationAmount * moveRatio1
              bubble2.cagrIndex += normalizedX * separationAmount * moveRatio2
              bubble2.marketShareIndex += normalizedY * separationAmount * moveRatio2
            } else if (distance === 0 || (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001)) {
              // Handle exact overlap (same position) - push apart in diagonal direction
              hasOverlap = true
              const avgRadius = (avgRadius1 + avgRadius2) / 2
              const pushDistance = avgRadius * minSeparationFactor * damping * 2
              const angle = Math.random() * Math.PI * 2 // Random angle to avoid conflicts
              bubble1.cagrIndex -= Math.cos(angle) * pushDistance
              bubble1.marketShareIndex -= Math.sin(angle) * pushDistance
              bubble2.cagrIndex += Math.cos(angle) * pushDistance
              bubble2.marketShareIndex += Math.sin(angle) * pushDistance
            }
          }
        }
        
        // If no overlaps found or overlap is very small, we're done
        if (!hasOverlap || maxOverlap < 0.0001) {
          break
        }
      }
      
      return separated
    }
    
    return separateBubbles(initialData)
  }, [data, maxOpportunity, minOpportunity, sizeRange])

  // Calculate padding needed for largest bubble to be fully visible
  // After separation, bubbles may have moved, so recalculate bounds
  const cagrMin = Math.min(...transformedData.map(d => d.cagrIndex))
  const cagrMax = Math.max(...transformedData.map(d => d.cagrIndex))
  const cagrRange = cagrMax - cagrMin
  const shareMin = Math.min(...transformedData.map(d => d.marketShareIndex))
  const shareMax = Math.max(...transformedData.map(d => d.marketShareIndex))
  const shareRange = shareMax - shareMin
  
  // Find the largest bubble size for padding calculation
  const maxBubbleSize = Math.max(...transformedData.map(d => d.size))
  
  // Calculate padding: ensure all bubbles (including separated ones) are fully visible
  // Convert bubble radius to data coordinate units for proper padding
  // Use same dimensions as separation algorithm for consistency
  const estimatedChartWidth = 450 // Account for margins
  const estimatedChartHeight = 300 // Account for margins
  const pixelToDataX = (cagrRange || 1) / estimatedChartWidth
  const pixelToDataY = (shareRange || 1) / estimatedChartHeight
  const maxRadiusDataX = (maxBubbleSize / 2) * pixelToDataX
  const maxRadiusDataY = (maxBubbleSize / 2) * pixelToDataY
  
  // Add padding to ensure largest bubble doesn't get clipped
  // Use 20-25% of range or bubble radius, whichever is larger
  // Increased padding to account for separated bubbles
  const cagrPaddingTop = Math.max(maxRadiusDataX * 2.0, (cagrRange || 1) * 0.25, 0.8)
  const sharePaddingTop = Math.max(maxRadiusDataY * 2.0, (shareRange || 1) * 0.25, 0.8)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className={`p-4 rounded-lg border-2 shadow-lg ${
          isDark 
            ? 'bg-navy-card border-electric-blue text-white' 
            : 'bg-white border-electric-blue text-gray-900'
        }`}>
          <p className="font-bold text-base mb-2">{data.region}</p>
          <p className="text-sm mb-1">
            <strong>CAGR Index:</strong> {data.cagrIndex.toFixed(2)}
          </p>
          <p className="text-sm mb-1">
            <strong>Market Share Index:</strong> {data.marketShareIndex.toFixed(2)}
          </p>
          <p className="text-sm">
            <strong>Incremental Opportunity:</strong> {formatWithCommas(data.incrementalOpportunity, 1)} US$ Mn
          </p>
          {data.description && (
            <p className="text-xs mt-2 italic text-text-secondary-light dark:text-text-secondary-dark">
              {data.description}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Custom shape for 3D bubbles - each bubble has its own color
  const CustomShape = (props: any): JSX.Element => {
    const { cx, cy, payload } = props
    const region = payload?.region || 'Unknown'
    const size = payload?.size || 50
    
    // Get color from payload or colorMap
    let bubbleColor = BLUE_COLOR
    if (payload) {
      // First try to get color from payload directly
      if (payload.color) {
        bubbleColor = payload.color
      } else {
        // Look up color from colorMap using region and coordinates
        const key = `${payload.region}-${payload.cagrIndex}-${payload.marketShareIndex}`
        const mappedColor = colorMap.get(key)
        if (mappedColor) {
          bubbleColor = mappedColor
        }
      }
    }
    
    // Ensure cx and cy are valid numbers, default to 0 if not
    const x = typeof cx === 'number' ? cx : 0
    const y = typeof cy === 'number' ? cy : 0
    
    // Create unique ID for each bubble to avoid gradient conflicts
    const bubbleId = `bubble-${region.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <g>
        {/* Shadow for 3D effect - use a lighter shadow with the bubble color */}
        <circle
          cx={x}
          cy={y + 2}
          r={size / 2}
          fill={bubbleColor}
          opacity={0.15}
        />
        {/* Main bubble with solid color and gradient for 3D effect */}
        <defs>
          <radialGradient id={`gradient-${bubbleId}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor={bubbleColor} stopOpacity={1} />
            <stop offset="50%" stopColor={bubbleColor} stopOpacity={0.95} />
            <stop offset="100%" stopColor={bubbleColor} stopOpacity={0.85} />
          </radialGradient>
          <filter id={`glow-${bubbleId}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Main bubble circle - use solid color with high opacity */}
        <circle
          cx={x}
          cy={y}
          r={size / 2}
          fill={bubbleColor}
          fillOpacity={0.85}
          stroke={bubbleColor}
          strokeWidth={2.5}
          strokeOpacity={1}
          style={{
            transition: 'all 0.3s ease',
          }}
        />
        {/* Highlight for 3D effect */}
        <circle
          cx={x - size / 6}
          cy={y - size / 6}
          r={size / 4}
          fill="rgba(255, 255, 255, 0.5)"
        />
      </g>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Demo Data Watermark */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        style={{ opacity: 0.12 }}
      >
        <span 
          className="text-4xl font-bold text-gray-400 dark:text-gray-600 select-none"
          style={{ transform: 'rotate(-45deg)', transformOrigin: 'center' }}
        >
          Demo Data
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%" className="relative z-10">
        <RechartsScatterChart
          margin={{
            top: 60,
            right: 60,
            left: 100,
            bottom: 100,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#EAEAEA'} />
          <XAxis 
            type="number"
            dataKey="cagrIndex"
            stroke={isDark ? '#A0AEC0' : '#4A5568'}
            style={{ fontSize: '13px', fontWeight: 500 }}
            tick={{ fill: isDark ? '#E2E8F0' : '#2D3748', fontSize: 12 }}
            tickMargin={10}
            domain={[0, cagrMax + cagrPaddingTop]}
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
            label={{
              value: xAxisLabel,
              position: 'insideBottom',
              offset: -10,
              style: { 
                fontSize: '14px', 
                fontWeight: 500,
                fill: isDark ? '#E2E8F0' : '#2D3748'
              }
            }}
          />
          <YAxis 
            type="number"
            dataKey="marketShareIndex"
            stroke={isDark ? '#A0AEC0' : '#4A5568'}
            style={{ fontSize: '13px', fontWeight: 500 }}
            tick={{ fill: isDark ? '#E2E8F0' : '#2D3748', fontSize: 12 }}
            tickMargin={10}
            domain={[0, shareMax + sharePaddingTop]}
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              offset: -10,
              style: { 
                fontSize: '14px', 
                fontWeight: 500,
                fill: isDark ? '#E2E8F0' : '#2D3748',
                textAnchor: 'middle'
              }
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter 
            name="Regions" 
            data={transformedData} 
            fill={BLUE_COLOR}
            shape={CustomShape}
          >
            {transformedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || BLUE_COLOR} />
            ))}
          </Scatter>
        </RechartsScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className={`px-4 py-2 rounded-lg border ${
          isDark 
            ? 'bg-navy-card border-navy-light' 
            : 'bg-white border-gray-300'
        }`}>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            *Size of the bubble indicates incremental opportunity between 2025 and 2032
          </p>
        </div>
      </div>
    </div>
  )
}

