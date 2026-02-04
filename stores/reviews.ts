import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WeeklyReview } from '~/types'
import { LocalStorageAdapter } from '~/adapters/localStorage'

const persistence = new LocalStorageAdapter()
const STORAGE_KEY = 'reviews'

export const useReviewsStore = defineStore('reviews', () => {
  const reviews = ref<WeeklyReview[]>(persistence.load<WeeklyReview[]>(STORAGE_KEY) ?? [])

  function persist() {
    persistence.save(STORAGE_KEY, reviews.value)
  }

  const lastReview = computed(() => {
    if (reviews.value.length === 0) return null
    return reviews.value.reduce((latest, r) =>
      r.completedAt > latest.completedAt ? r : latest
    )
  })

  function addReview(review: WeeklyReview) {
    reviews.value.push(review)
    persist()
  }

  function setReviews(newReviews: WeeklyReview[]) {
    reviews.value = newReviews
    persist()
  }

  return {
    reviews,
    lastReview,
    addReview,
    setReviews,
  }
})
