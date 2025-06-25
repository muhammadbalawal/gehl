export interface Lead {
  id: number
  name: string
  shortName: string
  logo: string
  category: string
  rating: number
  totalReviews: number
  hours: string
  phone: string
  email: string
  address: string
  website: string
  photos: number
  monthlyVisitors: number
  facebook: {
    name: string
    url: string
    followers: number
    lastPost: string
    runningAds: boolean
    images: string[]
  }
  instagram?: {
    name: string
    handle: string
    followers: number
    lastPost: string
    runningAds: boolean
    images: string[]
  } | null
  google: {
    name: string
    url: string
    lastPost: string
    runningAds: boolean
    images: string[]
  }
  websiteImage: string
} 