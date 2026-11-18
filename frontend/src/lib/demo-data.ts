import type { Alert, CropKey, DirectoryUser, FieldReport, GeoPoint, User, UserRole } from '@/types'

/**
 * Demo data so every screen works before the FastAPI backend is connected.
 * All of it is clearly labelled "Urugero / Demo" in the UI.
 */

export const CROPS: CropKey[] = ['maize', 'beans', 'cassava', 'potato']

/** Diseases/pests the model can return, per crop (names as the model outputs them). */
export const DISEASES: Record<CropKey, string[]> = {
  maize: ['Northern leaf blight', 'Fall armyworm', 'Maize streak virus', 'Gray leaf spot'],
  beans: ['Angular leaf spot', 'Bean rust', 'Anthracnose'],
  cassava: ['Cassava mosaic disease', 'Cassava brown streak', 'Cassava green mite'],
  potato: ['Late blight', 'Early blight', 'Bacterial wilt'],
}

/** Approximate sector centres in Musanze district (demo map). */
export const SECTOR_COORDS: Record<string, GeoPoint> = {
  Muhoza: { lat: -1.4996, lng: 29.6347 },
  Cyuve: { lat: -1.4804, lng: 29.6702 },
  Kinigi: { lat: -1.4301, lng: 29.5919 },
  Busogo: { lat: -1.5583, lng: 29.5536 },
  Gacaca: { lat: -1.5225, lng: 29.6783 },
  Nyange: { lat: -1.4728, lng: 29.6037 },
}

export const SECTORS = Object.keys(SECTOR_COORDS)
export const DEMO_DISTRICT = 'Musanze'

/** Identities used by the demo sign-in buttons. */
export const DEMO_USERS: Record<UserRole, Omit<User, 'preferredLanguage'>> = {
  farmer: { id: 'u-farmer', fullName: 'Mukamana Esperance', phone: '+250788123456', role: 'farmer', district: 'Musanze', sector: 'Muhoza' },
  officer: { id: 'u-officer', fullName: 'A. Uwimana', phone: '+250788654321', role: 'officer', district: 'Musanze', sector: 'Muhoza' },
  admin: { id: 'u-admin', fullName: 'IHUTE Admin', phone: '+250788000111', role: 'admin', district: 'Musanze', sector: 'Muhoza' },
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

export function seedReports(): FieldReport[] {
  return [
    {
      id: '0241', farmerName: 'Mukamana E.', crop: 'maize', sector: 'Muhoza', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(35), ai: { disease: 'Northern leaf blight', confidence: 0.86 },
      alternatives: [{ disease: 'Gray leaf spot', confidence: 0.08 }, { disease: 'Other', confidence: 0.06 }],
      status: 'pending', description: 'Amababi afite ibibara birebire by’ikigina.',
    },
    {
      id: '0240', farmerName: 'Habimana J.', crop: 'beans', sector: 'Cyuve', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(80), ai: { disease: 'Angular leaf spot', confidence: 0.71 },
      alternatives: [{ disease: 'Bean rust', confidence: 0.19 }, { disease: 'Other', confidence: 0.1 }],
      status: 'pending',
    },
    {
      id: '0239', farmerName: 'Nyirabera M.', crop: 'cassava', sector: 'Kinigi', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(190), ai: { disease: 'Cassava mosaic disease', confidence: 0.62 },
      alternatives: [{ disease: 'Cassava green mite', confidence: 0.24 }, { disease: 'Other', confidence: 0.14 }],
      status: 'needs_photo', reviewedAt: minutesAgo(120),
    },
    {
      id: '0238', farmerName: 'Niyonzima P.', crop: 'potato', sector: 'Muhoza', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(260), ai: { disease: 'Late blight', confidence: 0.89 },
      alternatives: [{ disease: 'Early blight', confidence: 0.07 }, { disease: 'Other', confidence: 0.04 }],
      status: 'pending',
    },
    {
      id: '0237', farmerName: 'Uwase C.', crop: 'maize', sector: 'Cyuve', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(400), ai: { disease: 'Fall armyworm', confidence: 0.93 },
      alternatives: [{ disease: 'Northern leaf blight', confidence: 0.04 }, { disease: 'Other', confidence: 0.03 }],
      status: 'verified', confirmedDisease: 'Fall armyworm', reviewedAt: minutesAgo(300),
      officerAdvice: 'Reba ibigori byawe buri munsi. Nubona inyo, zikureho kandi ubaze umujyanama mbere yo gukoresha umuti.',
    },
    {
      id: '0235', farmerName: 'Ndayisaba T.', crop: 'maize', sector: 'Cyuve', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(1500), ai: { disease: 'Fall armyworm', confidence: 0.88 },
      alternatives: [{ disease: 'Other', confidence: 0.12 }],
      status: 'verified', confirmedDisease: 'Fall armyworm', reviewedAt: minutesAgo(1400),
    },
    {
      id: '0228', farmerName: 'Mukeshimana A.', crop: 'maize', sector: 'Muhoza', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(2900), ai: { disease: 'Fall armyworm', confidence: 0.81 },
      alternatives: [{ disease: 'Other', confidence: 0.19 }],
      status: 'verified', confirmedDisease: 'Fall armyworm', reviewedAt: minutesAgo(2800),
    },
    {
      id: '0221', farmerName: 'Bizimana F.', crop: 'maize', sector: 'Gacaca', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(4300), ai: { disease: 'Fall armyworm', confidence: 0.77 },
      alternatives: [{ disease: 'Other', confidence: 0.23 }],
      status: 'verified', confirmedDisease: 'Fall armyworm', reviewedAt: minutesAgo(4200),
    },
    {
      id: '0219', farmerName: 'Ingabire D.', crop: 'beans', sector: 'Busogo', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(5000), ai: { disease: 'Bean rust', confidence: 0.58 },
      alternatives: [{ disease: 'Angular leaf spot', confidence: 0.3 }, { disease: 'Other', confidence: 0.12 }],
      status: 'rejected', reviewedAt: minutesAgo(4900),
    },
    {
      id: '0216', farmerName: 'Hakizimana O.', crop: 'potato', sector: 'Kinigi', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(6100), ai: { disease: 'Late blight', confidence: 0.84 },
      alternatives: [{ disease: 'Early blight', confidence: 0.1 }, { disease: 'Other', confidence: 0.06 }],
      status: 'pending',
    },
    {
      id: '0214', farmerName: 'Mutoni G.', crop: 'potato', sector: 'Nyange', district: DEMO_DISTRICT,
      submittedAt: minutesAgo(6500), ai: { disease: 'Late blight', confidence: 0.79 },
      alternatives: [{ disease: 'Bacterial wilt', confidence: 0.12 }, { disease: 'Other', confidence: 0.09 }],
      status: 'pending',
    },
  ]
}

export function seedAlerts(): Alert[] {
  return [
    {
      id: 'a-12', crop: 'maize', title: 'Nkongwa mu bigori', sector: 'Cyuve', district: DEMO_DISTRICT, radiusKm: 5,
      message: 'Reba ibigori byawe. Nubona ibimenyetso, fata ifoto ubaze umujyanama. Ntukoreshe umuti utabanje kugisha inama umujyanama w’ubuhinzi.',
      farmersReached: 84, reportIds: ['0235', '0228', '0221'], level: 2, status: 'draft', createdAt: minutesAgo(60),
    },
    {
      id: 'a-11', crop: 'maize', title: 'Nkongwa mu bigori', sector: 'Muhoza', district: DEMO_DISTRICT, radiusKm: 3,
      message: 'Nkongwa yagaragaye mu bigori hafi yawe. Reba amababi buri munsi kandi ubaze umujyanama nubona inyo.',
      farmersReached: 112, reportIds: ['0237'], level: 2, status: 'sent', createdAt: minutesAgo(320), sentAt: minutesAgo(290),
    },
    {
      id: 'a-09', crop: 'potato', title: 'Ububore bw’ibirayi', sector: 'Kinigi', district: DEMO_DISTRICT, radiusKm: 4,
      message: 'Imvura nyinshi yongera ububore bw’ibirayi. Kura amababi yarwaye kandi ubaze umujyanama.',
      farmersReached: 63, reportIds: [], level: 1, status: 'sent', createdAt: minutesAgo(3000), sentAt: minutesAgo(2950),
    },
  ]
}

export function seedUsers(): DirectoryUser[] {
  const farmers: [string, string][] = [
    ['Mukamana Esperance', 'Muhoza'], ['Habimana Jean', 'Cyuve'], ['Nyirabera Marie', 'Kinigi'],
    ['Niyonzima Pacifique', 'Muhoza'], ['Uwase Claudine', 'Cyuve'], ['Ndayisaba Theo', 'Cyuve'],
    ['Ingabire Diane', 'Busogo'], ['Hakizimana Olivier', 'Kinigi'], ['Mutoni Grace', 'Nyange'],
  ]
  return [
    ...farmers.map(([fullName, sector], i) => ({
      id: `f-${i}`, fullName, role: 'farmer' as const, phone: `+25078${8100000 + i * 1137}`,
      district: DEMO_DISTRICT, sector, active: i !== 6, joinedAt: minutesAgo(60 * 24 * (12 + i * 9)),
    })),
    { id: 'o-1', fullName: 'Aline Uwimana', role: 'officer', phone: '+250788654321', district: DEMO_DISTRICT, sector: 'Muhoza', active: true, joinedAt: minutesAgo(60 * 24 * 200) },
    { id: 'o-2', fullName: 'Eric Mugisha', role: 'officer', phone: '+250788654999', district: 'Burera', sector: 'Cyanika', active: true, joinedAt: minutesAgo(60 * 24 * 150) },
    { id: 'ad-1', fullName: 'IHUTE Admin', role: 'admin', phone: '+250788000111', district: 'Gasabo', sector: 'Kimihurura', active: true, joinedAt: minutesAgo(60 * 24 * 300) },
  ]
}

/** Stand-in for the diagnosis model until the API is connected. */
export function mockDiagnose(crop: CropKey) {
  const list = DISEASES[crop]
  const main = list[Math.floor(Math.random() * list.length)]
  const confidence = 0.62 + Math.random() * 0.3
  const second = list.find((d) => d !== main) ?? 'Other'
  const secondConf = (1 - confidence) * 0.6
  return {
    ai: { disease: main, confidence },
    alternatives: [
      { disease: second, confidence: secondConf },
      { disease: 'Other', confidence: 1 - confidence - secondConf },
    ],
  }
}

/** Rough reach estimate: farmers registered within the radius (demo density). */
export const estimateReach = (radiusKm: number) => Math.round(radiusKm * radiusKm * 3.4 + 2)
