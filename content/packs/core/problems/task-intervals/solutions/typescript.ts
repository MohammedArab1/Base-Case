class Solution {
  leastInterval(tasks: string, cooldown: number): number {
    const counts = new Array<number>(26).fill(0)

    for (const task of tasks) {
      counts[task.charCodeAt(0) - 65] += 1
    }

    const maximum = Math.max(...counts)
    const tied = counts.filter((count) => count === maximum).length
    const frame = (maximum - 1) * (cooldown + 1) + tied

    return Math.max(frame, tasks.length)
  }
}

export { Solution }
