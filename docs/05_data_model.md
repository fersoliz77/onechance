# OneChance — Modelo de datos

Separación entre Firestore y Realtime Database según documento de arquitectura v1.1.

## Firestore — datos estáticos (para filtros)

### Colección `users`
```
users/{uid}
  role: 'player' | 'coach' | 'club' | 'agent'
  email: string
  createdAt: timestamp
```

### Colección `players`
```
players/{uid}
  fullName: string
  birthDate: string          ← para detectar menor
  gender: 'M' | 'F'
  nationality: string        ← filtro
  position: string           ← filtro (ver lista en Shared.jsx)
  strongFoot: 'Der' | 'Izq' | 'Ambas'
  height: string
  weight: string
  ageRange: '13-17' | '18-22' | '23-30'  ← filtro
  bio: string
  career: [{ club, years }]
  characteristics: string[]  ← máx 6
  isMinor: boolean
  isFeatured: boolean
```

### Colección `coaches`
```
coaches/{uid}
  fullName: string
  nationality: string
  age: number
  skills: string[]
  languages: string[]
  bio: string
  career: [{ club, role, years }]
  trophies: string[]
  currentClub: string
  years: number              ← años de experiencia
```

### Colección `clubs`
```
clubs/{uid}
  name: string
  country: string
  city: string
  province: string
  division: string
  president: string
  currentDirector: string
  currentCoach: string
  founded: number
  seeking: string[]          ← posiciones buscadas
  bio: string
  achievements: string[]
```

### Colección `agents`
```
agents/{uid}
  fullName: string
  nationality: string
  agencyName: string
  players: number
  countries: number
  markets: string[]
  bio: string
  career: string
  notableTransfers: string[]
```

---

## Realtime Database — datos dinámicos

```
/profiles/{uid}
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'hidden'
  currentClub: string
  completionPct: number
  visibility:
    showContact: boolean
    featured: boolean
    notifications: boolean
  updatedAt: timestamp

/videos/{uid}
  /{videoId}
    type: 'embed' | 'upload'
    platform: 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | null
    title: string
    url: string | null
    storageRef: string | null
    status: 'active' | 'hidden'
    createdAt: timestamp

/photos/{uid}
  /{photoId}
    storageRef: string
    order: number
    createdAt: timestamp
```

---

## Estados de perfil y flujo

```
[registro] → draft
draft → [usuario envía] → pending
pending → [admin aprueba] → published
pending → [admin rechaza] → rejected
rejected → [usuario corrige y reenvía] → pending
published → [admin oculta] → hidden
hidden → [admin restaura] → published

EXCEPCIÓN: si isMinor === true
  [usuario envía] → pending (siempre, sin importar reglas globales)
```

---

## Posiciones disponibles
Arquero, Defensa, Lateral derecho, Lateral izquierdo, Volante, Mediocampista central, Extremo derecho, Extremo izquierdo, Enganche, Segundo delantero, Marcador central, Carrilero, Delantero

## Países soportados (V1)
Argentina, Uruguay, Brasil, Chile, Colombia, Paraguay, México, Perú, Ecuador, Bolivia, Venezuela
