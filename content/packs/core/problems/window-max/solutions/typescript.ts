class Solution {
  windowMax(nums: number[], k: number): number[] {
    const candidates: number[] = []
    let head = 0
    const answers: number[] = []

    for (let index = 0; index < nums.length; index += 1) {
      const value = nums[index]!
      let last = candidates[candidates.length - 1]

      while (last !== undefined && last >= head && nums[last]! <= value) {
        candidates.pop()
        last = candidates[candidates.length - 1]
      }

      // Popping can remove every active entry while stale prefix entries remain.
      // Reset the read position so the new index becomes the front.
      if (candidates.length <= head) {
        candidates.length = 0
        head = 0
      }

      candidates.push(index)

      if (candidates[head]! <= index - k) {
        head += 1

        // Drop consumed indices occasionally so memory stays proportional to k
        // instead of growing with the whole input.
        if (head > 1024 && head * 2 > candidates.length) {
          candidates.splice(0, head)
          head = 0
        }
      }

      if (index >= k - 1) {
        answers.push(nums[candidates[head]!]!)
      }
    }

    return answers
  }
}

export { Solution }
