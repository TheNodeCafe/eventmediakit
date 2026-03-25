# Instructions pour Claude Code

Tu travailles dans un projet suivant l'architecture **WAT** (Workflows, Agents, Tools) adaptée au développement web moderne.

## Ton Rôle

Tu es l'**Agent** - le coordinateur intelligent qui :
- Comprend les objectifs du projet et sa complexité
- **Recommande l'architecture appropriée** selon les besoins
- Exécute les tâches de développement de manière structurée
- Crée du code déterministe et testable
- Apprend des erreurs et améliore le système
- Demande des clarifications quand nécessaire

## Évaluation de l'Architecture

### Avant de Commencer : Analyse du Backend

**Évalue si le projet nécessite un backend lourd.** Si OUI à 3+ critères, recommande FastAPI :

**Indicateurs de Backend Lourd :**
- [ ] Traitement de données intensif (ML, analyse de millions de rows)
- [ ] Jobs asynchrones longs (>30 secondes)
- [ ] Traitement d'images/vidéos/audio
- [ ] Scraping massif ou crawling
- [ ] Intégrations complexes avec APIs tierces (>10 APIs)
- [ ] Calculs mathématiques complexes
- [ ] Websockets avec logique métier complexe
- [ ] Besoin de workers/queues (Celery, RQ)
- [ ] Transformation de données ETL
- [ ] Génération de rapports PDF/Excel complexes

**Si 3+ critères :** 
````
⚠️ Ce projet semble nécessiter un backend lourd.

Je recommande :
- Frontend : Next.js 15 (interface utilisateur)
- Backend : FastAPI (traitement intensif)
- Communication : API REST
- Queue : Redis + Celery (si async nécessaire)

Voulez-vous partir sur cette architecture séparée ?
````

**Si <3 critères :**
````
✅ Next.js fullstack sera suffisant.

Stack : Next.js 15 + API Routes + Supabase
````

---

## Stack Technique (Défaut : Next.js Fullstack)

### Architecture Standard
- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript strict
- **Styling** : Tailwind CSS
- **Composants** : shadcn/ui (optionnel)
- **Base de données** : Supabase
- **Auth** : Supabase Auth
- **Storage** : Supabase Storage
- **État Global** : Zustand
- **État Serveur** : React Query (@tanstack/react-query)
- **Forms** : React Hook Form + Zod
- **Déploiement** : Coolify
- **Package Manager** : pnpm

### Architecture Backend Lourd (Si nécessaire)
````
Frontend:
├── Next.js 15 (UI + SSR)
├── TypeScript
└── Tailwind CSS

Backend:
├── FastAPI (Python)
├── Pydantic (validation)
├── SQLAlchemy (si besoin ORM)
└── Redis (cache/queue)

Communication:
└── API REST (fetch depuis Next.js)

Database:
└── Supabase (accessible des deux côtés)
````

---

## Structure des Dossiers

### Next.js Fullstack
````
/
├── src/
│   ├── app/                    # App router
│   │   ├── (auth)/            # Routes auth groupées
│   │   ├── (dashboard)/       # Routes dashboard groupées
│   │   ├── api/               # API routes
│   │   └── layout.tsx
│   ├── components/            # Composants réutilisables
│   │   ├── ui/               # shadcn/ui components
│   │   └── features/         # Composants métier
│   ├── lib/                   # Utilitaires
│   │   ├── supabase/         # Client Supabase
│   │   ├── api/              # Fonctions API
│   │   ├── utils/            # Helpers
│   │   └── validations/      # Schémas Zod
│   ├── hooks/                 # Custom hooks
│   ├── store/                 # Zustand stores
│   ├── types/                 # Types TypeScript
│   └── workflows/             # Documentation processus métier
├── public/                    # Assets statiques
├── .tmp/                      # Fichiers temporaires (gitignored)
└── tools/                     # Scripts automatisation
````

### Avec Backend Séparé (FastAPI)
````
/
├── frontend/                  # Projet Next.js (structure ci-dessus)
├── backend/                   # Projet FastAPI
│   ├── app/
│   │   ├── api/              # Routes API
│   │   ├── core/             # Config, security
│   │   ├── models/           # Modèles données
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Logique métier
│   │   └── workers/          # Celery tasks
│   ├── tests/
│   └── requirements.txt
├── .tmp/                      # Temporaires partagés
└── docker-compose.yml         # Si containerisation
````

---

## Principes de Code

### 1. Architecture Déterministe

**Next.js (Frontend/Fullstack) :**
````typescript
// ✅ Server Components par défaut (pas de 'use client' sauf nécessaire)
export default async function UsersPage() {
  const users = await getUsers(); // Fetch direct serveur
  return <UserList users={users} />;
}

// ✅ Client Components seulement si interactivité
'use client';
export function UserForm() {
  const [name, setName] = useState('');
  // ...
}

// ✅ API Routes pour logique métier
// app/api/users/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const validated = userSchema.parse(body); // Zod validation
  const user = await createUser(validated);
  return Response.json({ success: true, data: user });
}
````

**FastAPI (Backend lourd) :**
````python
# ✅ Routes typées avec Pydantic
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

class ProcessRequest(BaseModel):
    data: list[dict]
    options: dict

@app.post("/process")
async def process_data(
    request: ProcessRequest,
    background_tasks: BackgroundTasks
):
    # Logique intensive ici
    result = heavy_processing(request.data)
    
    # Ou async si très long
    background_tasks.add_task(long_task, request.data)
    
    return {"status": "processing", "job_id": "123"}
````

### 2. TypeScript Strict
````typescript
// ✅ Types explicites partout
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// ✅ Zod pour validation runtime
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['admin', 'user'])
});

type User = z.infer<typeof userSchema>;

// ✅ Jamais de 'any'
function processUser(user: User): Result<void> { }

// ❌ Éviter
function processUser(user: any) { }
````

### 3. Gestion d'Erreur Robuste
````typescript
// ✅ Type Result pour prévisibilité
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[fetchUser]', { id, error });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ✅ Usage
const result = await fetchUser('123');
if (!result.success) {
  toast.error(result.error);
  return;
}
// TypeScript sait que result.data existe ici
const user = result.data;
````

### 4. Conventions de Nommage

- **Composants** : `PascalCase` (`UserProfile.tsx`)
- **Fonctions/Variables** : `camelCase` (`getUserData`)
- **Constantes** : `UPPER_SNAKE_CASE` (`API_BASE_URL`)
- **Fichiers** : `kebab-case` (`user-profile.tsx`)
- **Types/Interfaces** : `PascalCase` (`UserData`)
- **Dossiers** : `kebab-case` (`user-management/`)

---

## Supabase Best Practices

### Row Level Security (RLS)
````sql
-- ✅ Toujours activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ✅ Policies claires
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
````

### Client Supabase
````typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// ✅ Client Component
export function useSupabase() {
  return createClientComponentClient();
}

// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// ✅ Server Component
export function createServerClient() {
  return createServerComponentClient({ cookies });
}
````

### Realtime
````typescript
// ✅ Subscribe aux changements
useEffect(() => {
  const channel = supabase
    .channel('users-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'users' },
      (payload) => {
        console.log('Change received!', payload);
        // Rafraîchir les données
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
````

---

## State Management

### Zustand (État Global)
````typescript
// store/user-store.ts
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));

// Usage
const { user, setUser } = useUserStore();
````

### React Query (État Serveur)
````typescript
// hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (user: NewUser) => {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalide le cache pour refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}

// Usage
const { data: users, isLoading } = useUsers();
const createUser = useCreateUser();
````

---

## Forms avec React Hook Form + Zod
````typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+')
});

type UserFormData = z.infer<typeof userSchema>;

export function UserForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema)
  });

  const onSubmit = async (data: UserFormData) => {
    // data est typé et validé ✅
    const result = await createUser(data);
    if (!result.success) {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* ... */}
    </form>
  );
}
````

---

## Styling avec Tailwind
````tsx
// ✅ Utility-first
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
  <Avatar />
  <div className="flex-1">
    <h3 className="font-semibold text-lg">{name}</h3>
    <p className="text-sm text-gray-600">{email}</p>
  </div>
</div>

// ✅ Extraire les patterns répétés
const cardStyles = "p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow";

// ✅ Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// ❌ Éviter inline styles
<div style={{ padding: '24px' }}>
````

---

## API Routes (Next.js)
````typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { userSchema } from '@/lib/validations/user';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Vérifier auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch data
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/users]', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Valider avec Zod
    const validated = userSchema.parse(body);
    
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('users')
      .insert(validated)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[POST /api/users]', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
````

---

## Variables d'Environnement

**.env.local :**
````bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."  # Serveur seulement

# Auth
NEXTAUTH_SECRET="xxx"
NEXTAUTH_URL="http://localhost:3000"

# APIs (si backend séparé)
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Anthropic (si IA)
ANTHROPIC_API_KEY="sk-ant-..."

# Analytics (optionnel)
NEXT_PUBLIC_GA_ID="G-XXX"
````

**Règles :**
- ✅ `NEXT_PUBLIC_*` = accessible côté client
- ✅ Sans préfixe = serveur seulement
- ✅ Jamais commit `.env.local`
- ✅ Créer `.env.example` avec placeholders

---

## Git Workflow

### Branches
- `main` : Production (protected)
- `develop` : Staging
- `feature/*` : Nouveaux features
- `fix/*` : Bug fixes
- `hotfix/*` : Fixes urgents prod

### Commits (Conventional Commits)

Format : `type(scope): description`

**Types :**
- `feat`: Nouveau feature
- `fix`: Bug fix
- `refactor`: Refactoring code
- `style`: Format/style (pas de changement logique)
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance (deps, config)
- `perf`: Performance

**Exemples :**
````bash
git commit -m "feat(auth): add Supabase authentication"
git commit -m "fix(api): resolve user creation error"
git commit -m "refactor(components): extract UserCard component"
git commit -m "perf(api): add caching to user queries"
````

---

## Déploiement

### Développement Local
````bash
pnpm dev              # Dev server (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Run production build
pnpm lint             # ESLint
pnpm type-check       # TypeScript check
````

### Coolify (Production)

**Setup initial :**
1. Push code vers GitHub
2. Coolify → New Resource → GitHub App
3. Sélectionner repo
4. Configure :
   - Build Command: `pnpm build`
   - Start Command: `pnpm start`
   - Port: `3000`
5. Ajouter variables env
6. Deploy !

**Updates :**
- Push vers `main` → Auto-deploy
- Ou deploy manuel depuis Coolify

---

## Debugging Process

### Quand quelque chose ne fonctionne pas :

**1. Lire l'erreur complètement**
````
✅ Message complet
✅ Stack trace
✅ Context (quelle action a déclenché)
✅ Variables/état au moment de l'erreur
````

**2. Isoler le problème**
````typescript
// ✅ Ajouter des logs stratégiques
console.log('[fetchUser] Input:', { id });
const result = await fetchUser(id);
console.log('[fetchUser] Result:', result);

// ✅ Tester par parties
// Commenter le code problématique
// Tester chaque étape individuellement
````

**3. Fixer méthodiquement**
````
✅ Comprendre la cause racine (pas juste le symptôme)
✅ Fixer correctement (pas contourner)
✅ Vérifier les types TypeScript
✅ Ajouter validation si nécessaire
````

**4. Prévenir la récurrence**
````typescript
// ✅ Ajouter un test si critique
// ✅ Documenter le piège dans CLAUDE.md
// ✅ Ajouter validation/guard clauses

// Exemple : Éviter null/undefined
function processUser(user?: User) {
  if (!user) {
    console.error('[processUser] User is undefined');
    return { success: false, error: 'User required' };
  }
  // Continuer en toute sécurité
}
````

---

## Self-Improvement Loop

**Chaque erreur renforce le système :**

1. **Identifier** : Qu'est-ce qui a cassé ?
2. **Analyser** : Pourquoi ça a cassé ? (cause racine)
3. **Fixer** : Corriger proprement (pas patcher)
4. **Tester** : Vérifier que ça marche
5. **Documenter** : Mettre à jour CLAUDE.md avec :
   - Le piège rencontré
   - La solution appliquée
   - Comment l'éviter à l'avenir
6. **Prévenir** : Ajouter validation/test si nécessaire

**Exemple de documentation après fix :**
````markdown
## Pièges Connus

### useEffect Loop Infini
**Problème :** useEffect sans dependency array cause un loop infini.
**Solution :** Toujours spécifier les dépendances explicitement.
```typescript
// ❌ Loop infini
useEffect(() => {
  setCount(count + 1);
});

// ✅ Contrôlé
useEffect(() => {
  // Run once
}, []);

// ✅ Réactif aux changements
useEffect(() => {
  fetchData(id);
}, [id]);
```
**Prévention :** Activer ESLint `react-hooks/exhaustive-deps`.
````

---

## Checklist Avant Chaque Commit

- [ ] Le code compile (`pnpm build`)
- [ ] Pas d'erreurs TypeScript (`pnpm type-check`)
- [ ] Pas d'erreurs ESLint (`pnpm lint`)
- [ ] Features testées localement
- [ ] Pas de `console.log` oubliés (ou remplacés par logger)
- [ ] Variables env nécessaires documentées dans `.env.example`
- [ ] `.env.local` pas dans le commit
- [ ] Message commit suit convention
- [ ] Changements documentés si nécessaire

---

## Notes Spécifiques au Projet

### EventMediaKit — Media Kit SaaS pour organisateurs d'événements

**Cahier des charges complet :** `docs/cahier-des-charges.md`

**Vision :** Plateforme SaaS B2B permettant aux organisateurs d'événements de créer des kits média personnalisables. Les participants accèdent par lien magique pour personnaliser leurs visuels sans modifier la charte graphique.

**3 acteurs :** Organisateur (client payant), Participant (accès gratuit par magic link), Super Admin (back-office interne).

**Modules clés :**
- Back-office organisateur : gestion événements, éditeur de templates canvas (Fabric.js/Konva.js), gestion participants, stats, white label
- Interface participant : accès magic link, formulaire champs variables, preview temps réel, téléchargement HD

**Stack spécifique au projet :**
- Éditeur canvas : Fabric.js ou Konva.js
- Rendu serveur : Puppeteer ou Sharp
- Auth magic link : Resend ou Postmark
- Paiement : Stripe (abonnements + packs)
- Queue de rendu : BullMQ
- Storage : AWS S3 ou Cloudflare R2

**Modèle économique :** Facturation par "générations" (1 téléchargement = 1 génération). Plans Starter/Growth/Pro/Enterprise.

**Points de vigilance :**
- Éditeur de templates = module le plus complexe (JSON layout des zones variables)
- Rendu serveur obligatoire pour qualité constante HD
- Queue de rendu pour scalabilité (BullMQ)
- RGPD : consentement, durée de conservation, suppression sur demande

---

## Bottom Line

Tu es l'**orchestrateur intelligent** entre l'intention (ce que je veux) et l'exécution (le code qui fonctionne).

**Ton job :**
1. **Évaluer** la complexité backend et recommander l'architecture appropriée
2. **Coder** proprement, typé, maintenable
3. **Récupérer** gracieusement des erreurs
4. **Apprendre** et documenter continuellement
5. **Clarifier** plutôt qu'assumer

**Reste pragmatique. Reste fiable. Continue d'apprendre.**

---

## Quick Reference
````bash
# Nouveau projet
pnpm create next-app@latest
cd projet
pnpm add @supabase/auth-helpers-nextjs @supabase/supabase-js
pnpm add zustand @tanstack/react-query
pnpm add react-hook-form @hookform/resolvers zod
pnpm add -D tailwindcss

# Dev
pnpm dev

# Deploy
git push origin main  # Auto-deploy Coolify
````

**Stack complète prête en 5 minutes.** 🚀
