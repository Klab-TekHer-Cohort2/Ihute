// Shared domain types, based on the IHUTE requirements document.

export type UserRole = 'farmer' | 'officer' | 'admin'

export interface User {
  id: string
  fullName: string
  phone: string
  role: UserRole
  district?: string
  sector?: string
  preferredLanguage: 'rw' | 'en'
}

export type VerificationStatus = 'pending' | 'under_investigation' | 'verified' | 'rejected'

/** Alert levels from section 7.4 */
export type AlertLevel = 0 | 1 | 2 | 3

export interface GeoPoint {
  lat: number
  lng: number
}

export interface DiagnosisReport {
  id: string
  crop: string
  imageUrl?: string
  symptomDescription?: string
  predictedDisease: string
  confidence: number // 0..1
  symptoms: string[]
  recommendedActions: string[]
  audioUrl?: string // Kinyarwanda TTS
  location?: GeoPoint
  submittedAt: string
  verificationStatus: VerificationStatus
}

export interface DiseaseCluster {
  id: string
  crop: string
  suspectedDisease: string
  area: string
  center: GeoPoint
  reportCount: number
  firstReportAt: string
  lastReportAt: string
  averageConfidence: number
  level: AlertLevel
  status: VerificationStatus
}

export interface CommunityAlert {
  id: string
  crop: string
  problem: string
  area: string
  symptoms: string[]
  measures: string[]
  issuedBy: string
  issuedAt: string
  level: AlertLevel
}

// ---- Demo/front-end models used by the screens (to be mapped to API responses) ----

export type CropKey = 'maize' | 'beans' | 'cassava' | 'potato'

/** Officer workflow for a farmer's report (designs 11 and 12). */
export type ReportStatus = 'pending' | 'needs_photo' | 'verified' | 'rejected'

export interface ReportCandidate {
  disease: string
  confidence: number // 0..1
}

export interface FieldReport {
  id: string
  farmerName: string
  crop: CropKey
  sector: string
  district: string
  submittedAt: string
  imageUrl?: string
  description?: string
  ai: ReportCandidate
  alternatives: ReportCandidate[]
  status: ReportStatus
  confirmedDisease?: string
  officerAdvice?: string
  sendAsVoice?: boolean
  reviewedAt?: string
}

export type AlertStatus = 'draft' | 'sent'

/** Community alert drafted and approved by an officer (design 13). */
export interface Alert {
  id: string
  crop: CropKey
  title: string
  message: string
  sector: string
  district: string
  radiusKm: number
  farmersReached: number
  reportIds: string[]
  level: AlertLevel
  status: AlertStatus
  createdAt: string
  sentAt?: string
}

export interface DirectoryUser {
  id: string
  fullName: string
  role: UserRole
  phone: string
  district: string
  sector: string
  active: boolean
  joinedAt: string
}
