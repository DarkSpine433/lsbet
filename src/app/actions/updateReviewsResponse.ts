'use server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const updateReviewsResponse = async ({ id, response }: { id: string; response: string }) => {
  const payload = await getPayload({ config })
  // You should extract the review ID and response from formData

  if (!id || !response) return
  try {
    // Validate that the response is not empty
    if (typeof response !== 'string' || response.trim() === '') {
      return {
        data: null,
        message: 'Odpowiedź nie może być pusta',
        isSuccess: false,
        kind: 'error',
      }
    }
    // Update the review response
    const updatedReview = await payload.update({
      collection: 'reviews', // required
      id: id, // required
      data: {
        response: response.trim(), // Ensure response is trimmed
      },
    })
    return {
      data: updatedReview,
      message: 'Odpowiedź na recenzję została pomyślnie zaktualizowana',
      isSuccess: true,
      kind: 'reviewResponseUpdated',
    }
  } catch (error) {
    return {
      data: null,
      message: 'Coś poszło nie tak podczas aktualizacji odpowiedzi na recenzję: ' + error,
      isSuccess: false,
      kind: 'error',
    }
  }
}

export const removeReviewsResponse = async ({ id }: { id: string }) => {
  const payload = await getPayload({ config })
  if (!id) return
  try {
    // Update the review response to an empty string
    const updatedReview = await payload.update({
      collection: 'reviews', // required
      id: id, // required
      data: {
        response: '', // Clear the response
      },
    })
    return {
      data: updatedReview,
      message: 'Odpowiedź na recenzję została pomyślnie usunięta',
      isSuccess: true,
      kind: 'reviewResponseRemoved',
    }
  } catch (error) {
    return {
      data: null,
      message: 'Coś poszło nie tak podczas usuwania odpowiedzi na recenzję: ' + error,
      isSuccess: false,
      kind: 'error',
    }
  }
}
