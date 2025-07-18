'use server'
import { getPayload } from 'payload'
import config from '@payload-config'
export const search = async ({ query }: { query: string }) => {
  const payload = await getPayload({ config: config })

  const searchResults = await payload.find({
    collection: 'search',
    depth: 4,
    limit: 12,
    select: {
      id: true,
      title: true,
      slug: true,
      categories: true,
      meta: true,
      doc: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                'doc.value': {
                  like: query,
                },
              },
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return searchResults.docs
}
