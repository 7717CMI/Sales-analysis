export interface CustomerIntelligenceData {
  region: string
  sNo: string
  companyName: string
  industrySector: string
  headquartersAddress: string
  yearsOfExistence: string
  name: string
  decisionRole: string
  emailId: string
  website: string
  telephone: string
  typeOfShovelRequired: string
  primaryUseCase: string
  estimatedVolumeRequirement: string
  replacementCycle: string
  existingBrandsUsed: string
  qualityPreference: string
  priceSensitivity: string
  certificationsRequired: string
  sustainabilityPreference: string
  demandAttractiveScore: string
  fitForOEMShovelType: string
  leadPotential: string
}

const regions = ["North America", "Europe", "Rest of Europe", "Asia Pacific", "Latin America", "Middle East", "Africa"]

const industrySectors = [
  "Landscaping (commercial grounds maintenance, development, tree care)",
  "Agriculture",
  "Construction & Infrastructure",
  "Mining & Quarrying",
  "Forestry",
  "Utility & Road Maintenance",
  "Snow Removal Services",
  "Municipal Services",
  "Warehouse & Logistics",
  "Manufacturing",
  "Real Estate Development",
  "Environmental Services"
]

const shovelTypes = [
  "Hand/garden shovels for crews",
  "Digging Shovel",
  "Snow Shovel",
  "Trenching Shovel",
  "Scoop Shovel",
  "Mining Rope Shovels",
  "Excavator shovel/bucket attachments",
  "Specialty shovel heads & handles"
]

const primaryUseCases = [
  "Landscaping installation & maintenance, tree/planting, grounds work",
  "Construction excavation and site preparation",
  "Snow removal and winter maintenance",
  "Agricultural field work and soil management",
  "Mining operations and material handling",
  "Forestry operations and trail maintenance",
  "Road maintenance and utility work",
  "Warehouse material handling"
]

const qualityPreferences = [
  "High-durability (pro/contractor-grade) to reduce downtime",
  "Brand-specific",
  "Brand-agnostic when specs met",
  "Standard quality acceptable",
  "Premium quality preferred"
]

const priceSensitivities = [
  "High",
  "Medium: multi-branch procurement seeks TCO optimization",
  "Low",
  "Price-sensitive",
  "Value-focused"
]

const leadPotentials = [
  "Hot - scale & centralized sourcing & frequent replenishment",
  "Warm - steady procurement",
  "Cold - occasional purchases",
  "Hot - large volume requirements",
  "Warm - moderate volume",
  "Cold - low volume"
]

const decisionRoles = [
  "Centralized Procurement & Branch Manager",
  "Operations Manager",
  "Facilities Manager",
  "Procurement Director",
  "Supply Chain Manager",
  "Equipment Manager",
  "Site Manager",
  "Purchasing Agent"
]

const existingBrands = [
  "SiteOne Landscape Supply",
  "Bully Tools",
  "Fiskars",
  "Ames",
  "Razor-Back",
  "Truper",
  "Spear & Jackson",
  "Woods",
  "Garant",
  "True Temper",
  "Multiple brands",
  "Local suppliers"
]

const replacementCycles = [
  "Annual",
  "1-2 years",
  "2-3 years",
  "3-5 years",
  "5-10 years",
  "As needed"
]

const certifications = [
  "OSHA workplace compliance",
  "BIS Approved",
  "ISO 9001",
  "CE Marking",
  "ANSI standards",
  "Vendor QA where applicable",
  "None required"
]

const sustainabilityPreferences = [
  "Documented corporate program emphasizing environmentally responsible equipment",
  "Recycled materials and low-emission supply chain",
  "Sustainable sourcing preferred",
  "Standard environmental compliance",
  "Not a priority"
]

const companyNames = [
  "BrightView Holdings, Inc.",
  "Atlas Supplies",
  "Global Construction Corp",
  "Premier Landscaping Services",
  "Industrial Equipment Solutions",
  "Mountain Mining Co.",
  "Urban Development Group",
  "Green Earth Landscaping",
  "Heavy Machinery Inc.",
  "Coastal Construction Services",
  "Forest Management Ltd.",
  "Snow Removal Experts",
  "Municipal Services Group",
  "Warehouse Solutions Inc.",
  "Agricultural Supply Co.",
  "Infrastructure Builders",
  "Road Maintenance Services",
  "Environmental Cleanup Corp",
  "Commercial Property Management",
  "Equipment Rental Services"
]

const firstNames = ["John", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Amanda", "James", "Lisa", "William", "Ashley", "Richard", "Michelle", "Joseph", "Kimberly", "Thomas", "Amy", "Ahmed", "Patel", "Maria", "Carlos", "Priya", "Chen"]

const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Patel", "Singh", "Wang", "Chen"]

const citiesByRegion: Record<string, string[]> = {
  "North America": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Toronto", "Vancouver", "Montreal"],
  "Europe": ["London", "Berlin", "Madrid", "Rome", "Paris", "Amsterdam", "Vienna", "Stockholm", "Copenhagen", "Zurich", "Brussels", "Warsaw"],
  "Rest of Europe": ["Prague", "Budapest", "Warsaw", "Bucharest", "Sofia", "Zagreb", "Belgrade", "Athens", "Lisbon", "Dublin"],
  "Asia Pacific": ["Tokyo", "Shanghai", "Singapore", "Sydney", "Melbourne", "Mumbai", "Delhi", "Bangkok", "Seoul", "Hong Kong", "Jakarta", "Manila"],
  "Latin America": ["São Paulo", "Mexico City", "Buenos Aires", "Lima", "Bogotá", "Santiago", "Caracas", "Rio de Janeiro", "Guatemala City", "Havana"],
  "Middle East": ["Dubai", "Riyadh", "Tel Aviv", "Doha", "Kuwait City", "Beirut", "Amman", "Abu Dhabi", "Muscat", "Manama"],
  "Africa": ["Cairo", "Johannesburg", "Lagos", "Nairobi", "Casablanca", "Accra", "Addis Ababa", "Tunis", "Algiers", "Dar es Salaam"]
}

function seededRandom(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function randomElement<T>(arr: T[], random: () => number): T {
  return arr[Math.floor(random() * arr.length)]
}

function randomInt(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

function generateEmail(firstName: string, lastName: string, companyName: string): string {
  const domain = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15) + '.com'
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName[0].toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}@${domain}`
  ]
  return formats[Math.floor(Math.random() * formats.length)]
}

function generatePhone(region: string, random: () => number): string {
  const formats: Record<string, string[]> = {
    "North America": ["1-{area}-{num}", "+1 ({area}) {num}"],
    "Europe": ["+{country} {area} {num}", "+{country}-{area}-{num}"],
    "Rest of Europe": ["+{country} {area} {num}", "+{country}-{area}-{num}"],
    "Asia Pacific": ["+{country} {area} {num}", "+{country}-{area}-{num}"],
    "Latin America": ["+{country} {area} {num}", "+{country}-{area}-{num}"],
    "Middle East": ["+{country} {area} {num}", "+{country}-{area}-{num}"],
    "Africa": ["+{country} {area} {num}", "+{country}-{area}-{num}"]
  }
  
  const format = randomElement(formats[region] || formats["North America"], random)
  const area = randomInt(100, 999, random)
  const num = randomInt(1000000, 9999999, random)
  const country = randomInt(1, 99, random)
  
  return format
    .replace('{area}', String(area))
    .replace('{num}', String(num))
    .replace('{country}', String(country))
}

function generateWebsite(companyName: string): string {
  const domain = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20) + '.com'
  return `https://www.${domain}`
}

function generateAddress(region: string, city: string, random: () => number): string {
  const streetNumbers = randomInt(100, 9999, random)
  const streetNames = ["Main St", "Commerce Blvd", "Industrial Ave", "Business Park", "Trade Center", "Commercial Dr", "Enterprise Way", "Corporate Blvd"]
  const street = randomElement(streetNames, random)
  return `${streetNumbers} ${street}, ${city}, ${region}`
}

function generateVolumeRequirement(random: () => number): string {
  const volumes = [
    `${randomInt(1, 10, random)},${randomInt(100, 999, random)}-${randomInt(1, 10, random)},${randomInt(100, 999, random)} units/year`,
    `${randomInt(500, 5000, random)} units/year`,
    `${randomInt(1000, 10000, random)} units annually`,
    `${randomInt(50, 500, random)} units per year`,
    `${randomInt(2000, 20000, random)} units/year`
  ]
  return randomElement(volumes, random)
}

function generateDemandScore(random: () => number): string {
  const scores = [
    "5 - largest national buyer; continuous replenishment",
    "4 - strong fit for contractor-grade equipment",
    "3 - moderate regional buyer",
    "2 - occasional purchases",
    "1 - low volume requirements"
  ]
  return randomElement(scores, random)
}

function generateFitScore(random: () => number): string {
  const scores = [
    "5 - excellent fit for all shovel categories",
    "4 - compatible with shovel categories",
    "3 - moderate fit for specific types",
    "2 - limited compatibility",
    "1 - minimal fit"
  ]
  return randomElement(scores, random)
}

export function generateCustomerIntelligenceData(): CustomerIntelligenceData[] {
  const data: CustomerIntelligenceData[] = []
  let sNo = 1
  
  // Generate more data for better visualization
  const totalRecords = 150
  
  for (let i = 0; i < totalRecords; i++) {
    const seed = i * 1000 + Date.now()
    const random = seededRandom(seed)
    
    const region = randomElement(regions, random)
    const city = randomElement(citiesByRegion[region] || citiesByRegion["North America"], random)
    const companyName = randomElement(companyNames, random)
    const industrySector = randomElement(industrySectors, random)
    const firstName = randomElement(firstNames, random)
    const lastName = randomElement(lastNames, random)
    const name = `${firstName} ${lastName}`
    const decisionRole = randomElement(decisionRoles, random)
    const emailId = generateEmail(firstName, lastName, companyName)
    const website = generateWebsite(companyName)
    const telephone = generatePhone(region, random)
    const address = generateAddress(region, city, random)
    const yearsOfExistence = String(randomInt(5, 100, random))
    const typeOfShovelRequired = randomElement(shovelTypes, random)
    const primaryUseCase = randomElement(primaryUseCases, random)
    const estimatedVolumeRequirement = generateVolumeRequirement(random)
    const replacementCycle = randomElement(replacementCycles, random)
    const existingBrandsUsed = randomElement(existingBrands, random)
    const qualityPreference = randomElement(qualityPreferences, random)
    const priceSensitivity = randomElement(priceSensitivities, random)
    const certificationsRequired = randomElement(certifications, random)
    const sustainabilityPreference = randomElement(sustainabilityPreferences, random)
    const demandAttractiveScore = generateDemandScore(random)
    const fitForOEMShovelType = generateFitScore(random)
    
    // Generate lead potential based on volume and other factors
    let leadPotential: string
    const volumeNum = parseInt(estimatedVolumeRequirement.replace(/[^0-9]/g, '')) || 0
    if (volumeNum > 5000 || demandAttractiveScore.includes('5')) {
      leadPotential = randomElement(leadPotentials.filter(l => l.includes('Hot')), random)
    } else if (volumeNum > 1000 || demandAttractiveScore.includes('4')) {
      leadPotential = randomElement(leadPotentials.filter(l => l.includes('Warm')), random)
    } else {
      leadPotential = randomElement(leadPotentials.filter(l => l.includes('Cold')), random)
    }
    
    data.push({
      region,
      sNo: String(sNo++),
      companyName,
      industrySector,
      headquartersAddress: address,
      yearsOfExistence,
      name,
      decisionRole,
      emailId,
      website,
      telephone,
      typeOfShovelRequired,
      primaryUseCase,
      estimatedVolumeRequirement,
      replacementCycle,
      existingBrandsUsed,
      qualityPreference,
      priceSensitivity,
      certificationsRequired,
      sustainabilityPreference,
      demandAttractiveScore,
      fitForOEMShovelType,
      leadPotential
    })
  }
  
  return data
}

let dataCache: CustomerIntelligenceData[] | null = null

export function getCustomerIntelligenceData(): CustomerIntelligenceData[] {
  if (!dataCache) {
    try {
      dataCache = generateCustomerIntelligenceData()
    } catch (error) {
      console.error('Error generating customer intelligence data:', error)
      dataCache = []
    }
  }
  return dataCache
}

export function clearCustomerIntelligenceCache(): void {
  dataCache = null
}


