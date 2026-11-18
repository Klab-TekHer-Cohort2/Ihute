/** Rwanda's 5 provinces and 30 districts (administrative divisions since 2006). */
export const PROVINCES = [
  { key: 'kigali', districts: ['Gasabo', 'Kicukiro', 'Nyarugenge'] },
  { key: 'north', districts: ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'] },
  {
    key: 'south',
    districts: ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  },
  { key: 'east', districts: ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'] },
  { key: 'west', districts: ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'] },
] as const

/** USSD short code for farmers without internet (from the design). */
export const USSD_CODE = '*801*45#'
