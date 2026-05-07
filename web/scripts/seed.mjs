/*
  Seed base for OneChance.
  Requires: firebase-admin credentials via GOOGLE_APPLICATION_CREDENTIALS.
*/

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'
import fs from 'node:fs'

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH
const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL

if (!serviceAccountPath || !databaseURL) {
  throw new Error('Missing env vars. Set GOOGLE_APPLICATION_CREDENTIALS (or FIREBASE_SERVICE_ACCOUNT_PATH) and FIREBASE_DATABASE_URL (or NEXT_PUBLIC_FIREBASE_DATABASE_URL).')
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL,
  })
}

const auth = getAuth()
const db = getFirestore()
const rtdb = getDatabase()

const accounts = [
  { email: 'superadmin@onechance.test', password: 'OneChance123!', systemRole: 'super_admin', accountRole: 'agent', name: 'Super Admin OneChance', photoURL: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80' },
  { email: 'admin.moderacion@onechance.test', password: 'OneChance123!', systemRole: 'admin', accountRole: 'coach', name: 'Admin Moderacion', photoURL: 'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?auto=format&fit=crop&w=300&q=80' },
  { email: 'admin.contenido@onechance.test', password: 'OneChance123!', systemRole: 'admin', accountRole: 'club', name: 'Admin Contenido', photoURL: 'https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=300&q=80' },
  { email: 'player.demo@onechance.test', password: 'OneChance123!', systemRole: 'user', accountRole: 'player', name: 'Jugador Demo', photoURL: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?auto=format&fit=crop&w=300&q=80' },
  { email: 'coach.demo@onechance.test', password: 'OneChance123!', systemRole: 'user', accountRole: 'coach', name: 'Tecnico Demo', photoURL: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&w=300&q=80' },
  { email: 'club.demo@onechance.test', password: 'OneChance123!', systemRole: 'user', accountRole: 'club', name: 'Club Demo', photoURL: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=300&q=80' },
  { email: 'agent.demo@onechance.test', password: 'OneChance123!', systemRole: 'user', accountRole: 'agent', name: 'Representante Demo', photoURL: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&w=300&q=80' },
]

const samplePlayers = [
  {
    uid: 'seed_player_1',
    fullName: 'Lucas Ferreira',
    birthDate: '2004-04-10',
    gender: 'M',
    nationality: 'Argentina',
    position: 'Delantero',
    strongFoot: 'Der',
    height: '1.82',
    weight: '76',
    ageRange: '18-22',
    bio: 'Delantero con mucha movilidad, ataque del espacio y buena definicion en zona de finalizacion.',
    career: [
      { club: 'Club Deportivo Norte', years: '2025-Actualidad' },
      { club: 'Atletico Capital', years: '2023-2025' },
      { club: 'Juventud Unida', years: '2021-2023' },
    ],
    characteristics: ['Definicion', 'Velocidad', 'Juego aereo', 'Presion alta'],
    isMinor: false,
    isFeatured: true,
    currentClub: 'Club Deportivo Norte',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 84,
    avatarUrl: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2200&q=80',
    preferredFormation: '4-3-3',
    languages: ['Espanol', 'Ingles'],
    social: { instagram: '@lucasferreira9', tiktok: '@lucasf9', youtube: 'youtube.com/@lucasferreira9' },
  },
  {
    uid: 'seed_player_2',
    fullName: 'Camila Rojas',
    birthDate: '2005-09-21',
    gender: 'F',
    nationality: 'Uruguay',
    position: 'Mediocampista central',
    strongFoot: 'Izq',
    height: '1.70',
    weight: '61',
    ageRange: '18-22',
    bio: 'Mediocampista de control y distribucion. Gran lectura tactica y claridad en el pase intermedio.',
    career: [
      { club: 'Atletico Capital', years: '2024-Actualidad' },
      { club: 'Union Pacifico', years: '2022-2024' },
      { club: 'Seleccion Sub-20', years: '2021-2022' },
    ],
    characteristics: ['Vision', 'Pase', 'Ritmo', 'Recuperacion'],
    isMinor: false,
    isFeatured: true,
    currentClub: 'Atletico Capital',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 82,
    avatarUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&w=2200&q=80',
    preferredFormation: '4-2-3-1',
    languages: ['Espanol', 'Portugues'],
    social: { instagram: '@camilarojas8', tiktok: '@camilarojas.mid', youtube: 'youtube.com/@camilarojas8' },
  },
  {
    uid: 'seed_player_3',
    fullName: 'Rodrigo Paredes',
    birthDate: '1999-02-02',
    gender: 'M',
    nationality: 'Colombia',
    position: 'Delantero',
    strongFoot: 'Der',
    height: '1.86',
    weight: '79',
    ageRange: '23-30',
    bio: 'Nueve de area con perfil fisico, buen juego de espaldas y remate potente con ambas piernas.',
    career: [
      { club: 'Real Andino', years: '2024-Actualidad' },
      { club: 'Deportivo Norte', years: '2022-2024' },
      { club: 'Seleccion Sub-23', years: '2020-2022' },
    ],
    characteristics: ['Potencia', 'Definicion', 'Fisico', 'Desmarque'],
    isMinor: false,
    isFeatured: false,
    currentClub: 'Real Andino',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 86,
    avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=2200&q=80',
    preferredFormation: '4-4-2',
    languages: ['Espanol'],
    social: { instagram: '@rodrigop9', tiktok: '@rodrigop9', youtube: 'youtube.com/@rodrigoparedes9' },
  },
  {
    uid: 'seed_player_4',
    fullName: 'Mateo Benitez',
    birthDate: '2003-01-18',
    gender: 'M',
    nationality: 'Paraguay',
    position: 'Extremo derecho',
    strongFoot: 'Der',
    height: '1.76',
    weight: '71',
    ageRange: '23-30',
    bio: 'Extremo vertical con uno contra uno agresivo, cambio de ritmo y centro tenso al segundo palo.',
    career: [
      { club: 'Olimpia del Sur', years: '2025-Actualidad' },
      { club: 'Deportivo Guarani', years: '2022-2025' },
      { club: 'Seleccion Sub-20', years: '2020-2022' },
    ],
    characteristics: ['Uno contra uno', 'Aceleracion', 'Centros', 'Retorno defensivo'],
    isMinor: false,
    isFeatured: false,
    currentClub: 'Olimpia del Sur',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 80,
    avatarUrl: 'https://images.unsplash.com/photo-1542204625-de293a06df52?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=2200&q=80&sat=-5',
    preferredFormation: '4-3-3',
    languages: ['Espanol', 'Guarani'],
    social: { instagram: '@mateobenitez11', tiktok: '@mateobenitez11', youtube: 'youtube.com/@mateobenitez11' },
  },
  {
    uid: 'seed_player_5',
    fullName: 'Valentina Mendez',
    birthDate: '2002-07-03',
    gender: 'F',
    nationality: 'Chile',
    position: 'Lateral izquierda',
    strongFoot: 'Izq',
    height: '1.68',
    weight: '59',
    ageRange: '23-30',
    bio: 'Lateral de largo recorrido, intensa en la marca y precisa en pases progresivos por banda.',
    career: [
      { club: 'Union Pacifico', years: '2024-Actualidad' },
      { club: 'Puerto Azul FC', years: '2021-2024' },
      { club: 'Seleccion Sub-23', years: '2019-2021' },
    ],
    characteristics: ['Resistencia', 'Marca', 'Centros rasos', 'Lectura defensiva'],
    isMinor: false,
    isFeatured: true,
    currentClub: 'Union Pacifico',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 83,
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=2200&q=80&sat=-10',
    preferredFormation: '4-4-2',
    languages: ['Espanol', 'Ingles'],
    social: { instagram: '@valenmendez3', tiktok: '@valenmendez3', youtube: 'youtube.com/@valenmendez3' },
  },
  {
    uid: 'seed_player_6',
    fullName: 'Thiago Sosa',
    birthDate: '2006-11-27',
    gender: 'M',
    nationality: 'Argentina',
    position: 'Arquero',
    strongFoot: 'Der',
    height: '1.91',
    weight: '84',
    ageRange: '18-22',
    bio: 'Arquero de reflejos rapidos, buen juego con pies y personalidad para liderar la ultima linea.',
    career: [
      { club: 'Club Deportivo Norte', years: '2025-Actualidad' },
      { club: 'Academia Sur', years: '2023-2025' },
      { club: 'Seleccion Sub-17', years: '2022-2023' },
    ],
    characteristics: ['Reflejos', 'Juego aereo', 'Salida rapida', 'Pase largo'],
    isMinor: false,
    isFeatured: false,
    currentClub: 'Club Deportivo Norte',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 79,
    avatarUrl: 'https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=900&q=80&sat=-20',
    coverImageUrl: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=2200&q=80',
    preferredFormation: '4-2-3-1',
    languages: ['Espanol'],
    social: { instagram: '@thiagososa1', tiktok: '@thiagososa1', youtube: 'youtube.com/@thiagososa1' },
  },
  {
    uid: 'seed_player_7',
    fullName: 'Daniela Acosta',
    birthDate: '2001-03-14',
    gender: 'F',
    nationality: 'Colombia',
    position: 'Delantera centro',
    strongFoot: 'Der',
    height: '1.74',
    weight: '63',
    ageRange: '23-30',
    bio: 'Delantera de area con gran tiempo de desmarque, presion tras perdida y definicion de primera.',
    career: [
      { club: 'Real Andino', years: '2023-Actualidad' },
      { club: 'Atletico Cafetero', years: '2020-2023' },
      { club: 'Seleccion Sub-20', years: '2018-2020' },
    ],
    characteristics: ['Definicion', 'Presion alta', 'Ataque al espacio', 'Cabezazo'],
    isMinor: false,
    isFeatured: true,
    currentClub: 'Real Andino',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 85,
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2200&q=80&sat=5',
    preferredFormation: '4-3-3',
    languages: ['Espanol', 'Portugues'],
    social: { instagram: '@danielaacosta9', tiktok: '@danielaacosta9', youtube: 'youtube.com/@danielaacosta9' },
  },
  {
    uid: 'seed_player_8',
    fullName: 'Bruno Almeida',
    birthDate: '1998-12-06',
    gender: 'M',
    nationality: 'Brasil',
    position: 'Mediocentro',
    strongFoot: 'Der',
    height: '1.83',
    weight: '78',
    ageRange: '23-30',
    bio: 'Mediocentro mixto con recuperacion agresiva, cambios de orientacion y gran lectura en transiciones.',
    career: [
      { club: 'Esporte Litoral', years: '2022-Actualidad' },
      { club: 'Bahia Central', years: '2019-2022' },
      { club: 'Seleccion Sub-23', years: '2017-2019' },
    ],
    characteristics: ['Recuperacion', 'Pase largo', 'Coberturas', 'Ritmo competitivo'],
    isMinor: false,
    isFeatured: false,
    currentClub: 'Esporte Litoral',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 84,
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=2200&q=80&sat=-8',
    preferredFormation: '4-1-4-1',
    languages: ['Portugues', 'Espanol'],
    social: { instagram: '@brunoalmeida5', tiktok: '@brunoalmeida5', youtube: 'youtube.com/@brunoalmeida5' },
  },
  {
    uid: 'seed_player_9',
    fullName: 'Sofia Navarro',
    birthDate: '2004-05-09',
    gender: 'F',
    nationality: 'Peru',
    position: 'Enganche',
    strongFoot: 'Der',
    height: '1.65',
    weight: '57',
    ageRange: '18-22',
    bio: 'Mediapunta creativa con gran giro en espacios cortos, ultimo pase y llegada sorpresiva al area.',
    career: [
      { club: 'Lima Sporting', years: '2024-Actualidad' },
      { club: 'Academia Inca', years: '2021-2024' },
      { club: 'Seleccion Sub-20', years: '2020-2021' },
    ],
    characteristics: ['Vision', 'Conduccion', 'Pase filtrado', 'Pelota parada'],
    isMinor: false,
    isFeatured: true,
    currentClub: 'Lima Sporting',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 81,
    avatarUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=2200&q=80&sat=-5',
    preferredFormation: '4-2-3-1',
    languages: ['Espanol', 'Ingles'],
    social: { instagram: '@sofianavarro10', tiktok: '@sofianavarro10', youtube: 'youtube.com/@sofianavarro10' },
  },
  {
    uid: 'seed_player_10',
    fullName: 'Nicolas Duarte',
    birthDate: '2000-08-30',
    gender: 'M',
    nationality: 'Uruguay',
    position: 'Defensor central',
    strongFoot: 'Der',
    height: '1.88',
    weight: '82',
    ageRange: '23-30',
    bio: 'Zaguero fuerte en duelos, salida limpia con pase vertical y liderazgo en balones detenidos.',
    career: [
      { club: 'Atletico Capital', years: '2023-Actualidad' },
      { club: 'Rivera FC', years: '2020-2023' },
      { club: 'Seleccion Sub-23', years: '2018-2020' },
    ],
    characteristics: ['Duelos aereos', 'Anticipacion', 'Pase vertical', 'Orden defensivo'],
    isMinor: false,
    isFeatured: false,
    currentClub: 'Atletico Capital',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 82,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=2200&q=80',
    preferredFormation: '4-4-2',
    languages: ['Espanol', 'Portugues'],
    social: { instagram: '@nicolasduarte2', tiktok: '@nicolasduarte2', youtube: 'youtube.com/@nicolasduarte2' },
  },
  {
    uid: 'seed_player_11',
    fullName: 'Agustina Pereira',
    birthDate: '2007-02-12',
    gender: 'F',
    nationality: 'Argentina',
    position: 'Extremo izquierda',
    strongFoot: 'Izq',
    height: '1.66',
    weight: '56',
    ageRange: '18-22',
    bio: 'Extremo habilidosa con recorte hacia adentro, remate colocado y alta intensidad sin pelota.',
    career: [
      { club: 'Club Deportivo Norte', years: '2025-Actualidad' },
      { club: 'Academia Pampeana', years: '2023-2025' },
      { club: 'Seleccion Sub-17', years: '2022-2023' },
    ],
    characteristics: ['Regate', 'Remate colocado', 'Desborde', 'Presion alta'],
    isMinor: false,
    isFeatured: true,
    currentClub: 'Club Deportivo Norte',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 78,
    avatarUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=2200&q=80&sat=-15',
    preferredFormation: '4-3-3',
    languages: ['Espanol'],
    social: { instagram: '@agustinapereira17', tiktok: '@agustinapereira17', youtube: 'youtube.com/@agustinapereira17' },
  },
  {
    uid: 'seed_player_12',
    fullName: 'Emiliano Cruz',
    birthDate: '1997-10-19',
    gender: 'M',
    nationality: 'Mexico',
    position: 'Lateral derecho',
    strongFoot: 'Der',
    height: '1.79',
    weight: '74',
    ageRange: '23-30',
    bio: 'Lateral profundo con buena sincronizacion ofensiva, cierres rapidos y centro al primer palo.',
    career: [
      { club: 'Monterrey Unido', years: '2022-Actualidad' },
      { club: 'Atlante Norte', years: '2019-2022' },
      { club: 'Seleccion Sub-23', years: '2017-2019' },
    ],
    characteristics: ['Proyeccion ofensiva', 'Marca', 'Centros', 'Velocidad de cierre'],
    isMinor: false,
    isFeatured: false,
    currentClub: 'Monterrey Unido',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 80,
    avatarUrl: 'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=2200&q=80',
    preferredFormation: '4-2-3-1',
    languages: ['Espanol', 'Ingles'],
    social: { instagram: '@emilianocruz4', tiktok: '@emilianocruz4', youtube: 'youtube.com/@emilianocruz4' },
  },
  {
    uid: 'seed_player_13',
    fullName: 'Renata Flores',
    birthDate: '2003-06-01',
    gender: 'F',
    nationality: 'Ecuador',
    position: 'Volante mixta',
    strongFoot: 'Der',
    height: '1.72',
    weight: '62',
    ageRange: '23-30',
    bio: 'Volante dinamica con ida y vuelta, recuperacion en campo rival y buen golpeo de media distancia.',
    career: [
      { club: 'Quito City', years: '2024-Actualidad' },
      { club: 'Deportivo Sierra', years: '2021-2024' },
      { club: 'Seleccion Sub-20', years: '2019-2021' },
    ],
    characteristics: ['Intensidad', 'Remate lejano', 'Recuperacion', 'Pase corto'],
    isMinor: false,
    isFeatured: false,
    currentClub: 'Quito City',
    status: 'published',
    photos: 6,
    videos: 6,
    overall: 82,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=2200&q=80&sat=-5',
    preferredFormation: '4-3-3',
    languages: ['Espanol'],
    social: { instagram: '@renataflores6', tiktok: '@renataflores6', youtube: 'youtube.com/@renataflores6' },
  },
]

const sampleCoaches = [
  { uid: 'seed_coach_1', fullName: 'Martín Álvarez', nationality: 'Uruguay', years: 12, age: 44, currentClub: 'Atletico Capital', avatarUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80', style: 'Posicional' },
  { uid: 'seed_coach_2', fullName: 'Gustavo Herrera', nationality: 'Argentina', years: 15, age: 49, currentClub: 'Club Deportivo Norte', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80', style: 'Presion alta' },
  { uid: 'seed_coach_3', fullName: 'Paula Gomez', nationality: 'Chile', years: 9, age: 38, currentClub: 'Union Pacifico', avatarUrl: 'https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=900&q=80', style: 'Juego de posesion' },
  { uid: 'seed_coach_4', fullName: 'Renato Silva', nationality: 'Brasil', years: 11, age: 42, currentClub: 'Esporte Litoral', avatarUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=900&q=80', style: 'Transiciones rapidas' },
  { uid: 'seed_coach_5', fullName: 'Andres Leon', nationality: 'Colombia', years: 8, age: 37, currentClub: 'Real Andino', avatarUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=900&q=80', style: 'Desarrollo juvenil' },
]

const sampleClubs = [
  { uid: 'seed_club_1', name: 'Club Deportivo Norte', country: 'Argentina', city: 'Rosario', founded: 1968, division: 'Primera Division', stadium: 'Estadio Nuevo Norte', capacity: 24000, imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1600&q=80' },
  { uid: 'seed_club_2', name: 'Atletico Capital', country: 'Uruguay', city: 'Montevideo', founded: 1937, division: 'Primera Division', stadium: 'Parque del Puerto', capacity: 18500, imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1600&q=80' },
  { uid: 'seed_club_3', name: 'Union Pacifico', country: 'Chile', city: 'Valparaiso', founded: 1959, division: 'Segunda Division', stadium: 'Estadio Pacifico', capacity: 12000, imageUrl: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1600&q=80' },
  { uid: 'seed_club_4', name: 'Real Andino', country: 'Colombia', city: 'Medellin', founded: 1974, division: 'Primera Division', stadium: 'Arena Andina', capacity: 30000, imageUrl: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80' },
  { uid: 'seed_club_5', name: 'Esporte Litoral', country: 'Brasil', city: 'Santos', founded: 1948, division: 'Femenino', stadium: 'Ilha Litoral', capacity: 16000, imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80' },
]

const sampleAgents = [
  { uid: 'seed_agent_1', fullName: 'Carlos Vega', nationality: 'Argentina', agencyName: 'Vega Sports', players: 14, countries: 5, imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=900&q=80' },
  { uid: 'seed_agent_2', fullName: 'Maria Costa', nationality: 'Uruguay', agencyName: 'Costa Talent', players: 11, countries: 4, imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80' },
  { uid: 'seed_agent_3', fullName: 'Felipe Mena', nationality: 'Chile', agencyName: 'Mena Football', players: 9, countries: 3, imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80' },
  { uid: 'seed_agent_4', fullName: 'Juliana Prado', nationality: 'Brasil', agencyName: 'Prado Agency', players: 16, countries: 6, imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80' },
  { uid: 'seed_agent_5', fullName: 'Ivan Torres', nationality: 'Colombia', agencyName: 'Torres Global', players: 12, countries: 5, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80' },
]

const playerMedia = {
  seed_player_1: {
    photos: [
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1543357480-c60d40007a3f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80&sat=-20',
      'https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [
      { title: 'Highlights 2025', platform: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
      { title: 'Definicion en el area', platform: 'youtube', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
    ],
  },
  seed_player_2: {
    photos: [
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [
      { title: 'Vision de juego', platform: 'youtube', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
      { title: 'Pases entre lineas', platform: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    ],
  },
  seed_player_3: {
    photos: [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=80&sat=20',
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1000&q=80&sat=-10',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=80&sat=-25',
    ],
    videos: [
      { title: 'Juego de espaldas', platform: 'youtube', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
      { title: 'Finalizaciones 2024', platform: 'youtube', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
    ],
  },
  seed_player_4: {
    photos: [
      'https://images.unsplash.com/photo-1542204625-de293a06df52?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1000&q=80&sat=-8',
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1000&q=80&sat=15',
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [
      { title: 'Desborde y centro', platform: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
      { title: 'Highlights temporada', platform: 'youtube', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
    ],
  },
  seed_player_5: {
    photos: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1000&q=80&sat=-10',
      'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [
      { title: 'Lectura defensiva', platform: 'youtube', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
      { title: 'Proyecciones por banda', platform: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    ],
  },
  seed_player_6: {
    photos: [
      'https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [
      { title: 'Atajadas clave', platform: 'youtube', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
      { title: 'Juego con los pies', platform: 'youtube', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
    ],
  },
  seed_player_7: {
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1000&q=80&sat=10',
      'https://images.unsplash.com/photo-1543357480-c60d40007a3f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80&sat=-12',
    ],
    videos: [
      { title: 'Definicion de primera', platform: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
      { title: 'Movimientos en el area', platform: 'youtube', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
    ],
  },
  seed_player_8: {
    photos: [
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=1000&q=80&sat=5',
      'https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80&sat=-15',
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [
      { title: 'Recuperaciones y coberturas', platform: 'youtube', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
      { title: 'Cambios de orientacion', platform: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    ],
  },
  seed_player_9: {
    photos: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=80&sat=20',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1543357480-c60d40007a3f?auto=format&fit=crop&w=1000&q=80&sat=-5',
      'https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [
      { title: 'Ultimo pase', platform: 'youtube', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
      { title: 'Conduccion y remate', platform: 'youtube', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
    ],
  },
  seed_player_10: {
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?auto=format&fit=crop&w=1000&q=80&sat=-20',
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=80&sat=-10',
      'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [
      { title: 'Duelos aereos', platform: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
      { title: 'Salida limpia', platform: 'youtube', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
    ],
  },
  seed_player_11: {
    photos: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80&sat=10',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80&sat=-20',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80&sat=-5',
    ],
    videos: [
      { title: 'Recortes y definicion', platform: 'youtube', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
      { title: 'Presion tras perdida', platform: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    ],
  },
  seed_player_12: {
    photos: [
      'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1000&q=80&sat=8',
      'https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=80&sat=-12',
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1000&q=80',
    ],
    videos: [
      { title: 'Centros al area', platform: 'youtube', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
      { title: 'Cierres defensivos', platform: 'youtube', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
    ],
  },
  seed_player_13: {
    photos: [
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80&sat=15',
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1000&q=80&sat=-10',
      'https://images.unsplash.com/photo-1543357480-c60d40007a3f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1570498839593-e565b39455fc?auto=format&fit=crop&w=1000&q=80&sat=-8',
    ],
    videos: [
      { title: 'Ida y vuelta completa', platform: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
      { title: 'Remate de media distancia', platform: 'youtube', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
    ],
  },
}

async function upsertUserAccount(item) {
  let user
  try {
    user = await auth.getUserByEmail(item.email)
  } catch {
    user = await auth.createUser({ email: item.email, password: item.password, displayName: item.name, photoURL: item.photoURL || '' })
  }

  await auth.updateUser(user.uid, { displayName: item.name, photoURL: item.photoURL || '' })

  await auth.setCustomUserClaims(user.uid, { role: item.systemRole })

  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    email: item.email,
      name: item.name,
      photoURL: item.photoURL || '',
    role: item.accountRole,
    systemRole: item.systemRole,
    permissions: [],
    isActive: true,
    seedVersion: 'v1',
    createdBySeed: true,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true })

  await rtdb.ref(`profiles/${user.uid}`).update({
    status: 'published',
    currentClub: '',
    completionPct: 80,
    visibility: { showContact: false, featured: false, notifications: true },
    seedVersion: 'v1',
  })

  return user.uid
}

async function main() {
  const report = []
  for (const account of accounts) {
    const uid = await upsertUserAccount(account)
    report.push({ uid, email: account.email, systemRole: account.systemRole, accountRole: account.accountRole })
  }

  for (const p of samplePlayers) {
    const gallery = playerMedia[p.uid]?.photos || []
    await db.collection('players').doc(p.uid).set({
      ...p,
      photoGallery: gallery,
      seedVersion: 'v2',
      createdBySeed: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  }

  const now = new Date().toISOString()
  for (const [uid, media] of Object.entries(playerMedia)) {
    const photosPayload = Object.fromEntries(media.photos.map((url, i) => [
      `seed_photo_${i + 1}`,
      {
        url,
        storagePath: `seed/photos/${uid}/seed_photo_${i + 1}.jpg`,
        createdAt: now,
      },
    ]))

    const videosPayload = Object.fromEntries(media.videos.map((v, i) => [
      `seed_video_${i + 1}`,
      {
        type: 'embed',
        platform: v.platform,
        title: v.title,
        url: v.url,
        storageRef: null,
        status: 'active',
        createdAt: now,
      },
    ]))

    await rtdb.ref(`photos/${uid}`).update(photosPayload)
    await rtdb.ref(`videos/${uid}`).update(videosPayload)
  }

  for (const c of sampleCoaches) {
    await db.collection('coaches').doc(c.uid).set({
      uid: c.uid,
      fullName: c.fullName,
      nationality: c.nationality,
      age: c.age,
      currentClub: c.currentClub,
      years: c.years,
      skills: [c.style, '4-3-3', 'Desarrollo juvenil'],
      languages: ['Espanol', 'Ingles'],
      bio: `Entrenador orientado a ${c.style.toLowerCase()} con enfoque en rendimiento competitivo y formacion integral.`,
      career: [
        { club: c.currentClub, role: 'DT Principal', years: '2022-Actualidad' },
        { club: 'Seleccion juvenil regional', role: 'Asistente', years: '2018-2022' },
      ],
      trophies: ['Copa Regional 2023'],
      avatarUrl: c.avatarUrl,
      status: 'published',
      seedVersion: 'v1',
      createdBySeed: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  }

  for (const c of sampleClubs) {
    await db.collection('clubs').doc(c.uid).set({
      uid: c.uid,
      name: c.name,
      country: c.country,
      city: c.city,
      province: '',
      division: c.division,
      president: 'Comision Directiva',
      currentDirector: 'Direccion Deportiva OneChance',
      currentCoach: 'Cuerpo tecnico estable',
      founded: c.founded,
      seeking: ['Delantero', 'Lateral izquierdo'],
      bio: `Institucion competitiva de ${c.city} orientada a potenciar talento joven y consolidar procesos profesionales.`,
      achievements: ['Ascenso 2021', 'Campeon regional 2024'],
      stadium: c.stadium,
      capacity: c.capacity,
      imageUrl: c.imageUrl,
      status: 'published',
      seedVersion: 'v1',
      createdBySeed: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  }

  for (const a of sampleAgents) {
    await db.collection('agents').doc(a.uid).set({
      uid: a.uid,
      fullName: a.fullName,
      nationality: a.nationality,
      agencyName: a.agencyName,
      players: a.players,
      countries: a.countries,
      markets: ['Argentina', 'Chile', 'Uruguay'],
      bio: 'Representante con foco en proyeccion internacional y negociacion responsable.',
      career: 'Intermediacion internacional, scouting y acompanamiento de carrera',
      notableTransfers: ['Transferencia juvenil a primera division', 'Cesion internacional sub-23'],
      avatarUrl: a.imageUrl,
      status: 'published',
      seedVersion: 'v1',
      createdBySeed: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  }

  fs.writeFileSync('seed-report.json', JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2))
  console.log('Seed completed:', report.length)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
