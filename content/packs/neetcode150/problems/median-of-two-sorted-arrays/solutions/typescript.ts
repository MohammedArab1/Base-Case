class Solution {
  findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    if (nums1.length > nums2.length) {
      return this.findMedianSortedArrays(nums2, nums1)
    }

    const m = nums1.length
    const n = nums2.length
    const total = m + n
    const half = Math.floor((total + 1) / 2)
    let low = 0
    let high = m

    while (low <= high) {
      const i = Math.floor((low + high) / 2)
      const j = half - i
      const left1 = i > 0 ? nums1[i - 1] : Number.NEGATIVE_INFINITY
      const right1 = i < m ? nums1[i] : Number.POSITIVE_INFINITY
      const left2 = j > 0 ? nums2[j - 1] : Number.NEGATIVE_INFINITY
      const right2 = j < n ? nums2[j] : Number.POSITIVE_INFINITY

      if (left1 <= right2 && left2 <= right1) {
        if (total % 2 === 1) {
          return Math.max(left1, left2)
        }
        return (Math.max(left1, left2) + Math.min(right1, right2)) / 2
      }

      if (left1 > right2) {
        high = i - 1
      } else {
        low = i + 1
      }
    }

    return 0
  }
}

export { Solution }
