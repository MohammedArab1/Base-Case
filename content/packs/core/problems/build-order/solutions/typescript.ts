class Solution {
  canBuildAll(numModules: number, prerequisites: number[][]): boolean {
    const nextModules: number[][] = Array.from({ length: numModules }, () => [])
    const indegree = new Array<number>(numModules).fill(0)

    for (const [module, prerequisite] of prerequisites) {
      nextModules[prerequisite].push(module)
      indegree[module] += 1
    }

    const ready: number[] = []

    for (let module = 0; module < numModules; module += 1) {
      if (indegree[module] === 0) {
        ready.push(module)
      }
    }

    let built = 0
    let head = 0

    while (head < ready.length) {
      const module = ready[head]
      head += 1
      built += 1

      for (const dependent of nextModules[module]) {
        indegree[dependent] -= 1
        if (indegree[dependent] === 0) {
          ready.push(dependent)
        }
      }
    }

    return built === numModules
  }
}

export { Solution }
