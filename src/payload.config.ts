// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Bets } from './collections/Bets'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { pl } from '@payloadcms/translations/languages/pl'
import { PlacedBets } from './collections/PlaceBets'
import { CuponCodes } from './collections/CuponCodes'
import { CasinoGames } from './collections/CasinoGames'
import { CasinoCategories } from './collections/CasinoCategories'

const validateEnv = (key: string, required: boolean = true): string => {
  const value = process.env[key]
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value || ''
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const getAllowedDomains = (): string[] => {
  const serverUrl = getServerSideURL()

  const baseDomains: string[] = [
    `${serverUrl}`,
    `lsbet-git-development-darkspine433s-projects.vercel.app`,
    'https://uploadthing.com',
    'http://mongodb.net',
    'https://mongodb.net',
    'https://mongodb.com',
    'http://mongodb.com',
    'https://ufs.sh',
    'http://ufs.sh',
  ]

  if (serverUrl?.includes('localhost')) {
    baseDomains.push('http://localhost:3000')
  }

  return baseDomains.filter(Boolean) // Remove any undefined values
}

const getJobsConfig = () => {
  const cronSecret = validateEnv('CRON_SECRET', false)

  if (!cronSecret) {
    console.warn('CRON_SECRET not found - job access will be user-only')
  }

  return {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow authenticated users
        if (req.user) return true

        // Allow requests with valid cron secret
        if (cronSecret) {
          const authHeader = req.headers.get('authorization')
          return authHeader === `Bearer ${cronSecret}`
        }

        return false
      },
    },
    tasks: [],
  }
}

export default buildConfig({
  i18n: {
    fallbackLanguage: 'pl',
    supportedLanguages: { pl },
  },
  admin: {
    suppressHydrationWarning: true,
    meta: {
      title: 'LSBets Admin Panel',
      titleSuffix: ' - LSBets',
      description: 'LsBet Admin Panel - Manage your LSBet website content',
      icons: [
        {
          rel: 'icon',
          type: 'image/jpeg',
          url: 'https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1beVeh3Fwfw9glnXS4C6WAJcNBbrvIad7PD2yU',
        },
      ],
      openGraph: {
        images: [
          {
            url: '/https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1bdEX04uQDXpVt0zI3oulY6iq2RyfQ8bOh4wP7',
            width: 1200,
            height: 630,
            alt: 'LSBets Admin Panel',
          },
        ],
        description: 'Admin panel for LSBets website',
        siteName: 'LSBets Admin Panel',
        title: 'LSBets Panel - PZS Złoczew',
      },
    },
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
      graphics: {
        Logo: '@/components/Logo/Logo#Logo',
        Icon: '@/components/Icon/Icon',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
      importMapFile: path.resolve(
        dirname,
        'app',
        '(payloadAuth)',
        '(payload)',
        'admin',
        'importMap.js',
      ),
    },
    user: Users.slug,
    avatar: 'default' as const,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },

  editor: defaultLexical,
  db: mongooseAdapter({
    url: validateEnv('DATABASE_URI'),
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Bets,
    PlacedBets,
    CuponCodes,
    CasinoGames,
    CasinoCategories,
  ],
  csrf: getAllowedDomains(),
  cors: getAllowedDomains(),
  globals: [Header, Footer],
  plugins: [...plugins],
  secret: validateEnv('PAYLOAD_SECRET'),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: getJobsConfig(),
  ...(process.env.NODE_ENV === 'production' && {
    rateLimit: {
      max: 2000,
      trustProxy: true,
    },
  }),
})
