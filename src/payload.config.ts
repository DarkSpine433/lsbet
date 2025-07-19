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
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

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
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
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
  collections: [Pages, Posts, Media, Categories, Users],
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
