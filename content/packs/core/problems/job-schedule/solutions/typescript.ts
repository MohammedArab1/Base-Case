class Solution {
  jobScheduling(starts: number[], ends: number[], profits: number[]): number {
    const jobs = ends
      .map((end, index) => ({ end, start: starts[index], profit: profits[index] }))
      .sort((left, right) => left.end - right.end)
    const finishTimes = jobs.map((job) => job.end)
    const dp = new Array<number>(jobs.length + 1).fill(0)

    const compatibleCount = (limit: number, endIndex: number): number => {
      let low = 0
      let high = endIndex

      while (low < high) {
        const middle = low + Math.floor((high - low) / 2)

        if (finishTimes[middle] <= limit) {
          low = middle + 1
        } else {
          high = middle
        }
      }

      return low
    }

    for (let index = 1; index <= jobs.length; index += 1) {
      const job = jobs[index - 1]
      const compatible = compatibleCount(job.start, index - 1)
      dp[index] = Math.max(dp[index - 1], job.profit + dp[compatible])
    }

    return dp[jobs.length]
  }
}

export { Solution }
