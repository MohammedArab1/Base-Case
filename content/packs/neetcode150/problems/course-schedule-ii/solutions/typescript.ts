class MinHeap {
  private data: number[] = []

  size(): number {
    return this.data.length
  }

  push(value: number): void {
    this.data.push(value)
    let index = this.data.length - 1
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.data[parent] <= this.data[index]) {
        break
      }
      ;[this.data[parent], this.data[index]] = [this.data[index], this.data[parent]]
      index = parent
    }
  }

  pop(): number {
    const top = this.data[0]
    const last = this.data.pop() as number
    if (this.data.length > 0) {
      this.data[0] = last
      let index = 0
      while (true) {
        const left = index * 2 + 1
        const right = left + 1
        let smallest = index
        if (left < this.data.length && this.data[left] < this.data[smallest]) {
          smallest = left
        }
        if (right < this.data.length && this.data[right] < this.data[smallest]) {
          smallest = right
        }
        if (smallest === index) {
          break
        }
        ;[this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]]
        index = smallest
      }
    }
    return top
  }
}

class Solution {
  findOrder(numCourses: number, prerequisites: number[][]): number[] {
    const graph: number[][] = Array.from({ length: numCourses }, () => [])
    const indegree: number[] = Array<number>(numCourses).fill(0)

    for (const [course, prerequisite] of prerequisites) {
      graph[prerequisite].push(course)
      indegree[course] += 1
    }

    const heap = new MinHeap()
    for (let course = 0; course < numCourses; course += 1) {
      if (indegree[course] === 0) {
        heap.push(course)
      }
    }

    const order: number[] = []
    while (heap.size() > 0) {
      const course = heap.pop()
      order.push(course)
      for (const dependent of graph[course]) {
        indegree[dependent] -= 1
        if (indegree[dependent] === 0) {
          heap.push(dependent)
        }
      }
    }

    return order.length === numCourses ? order : []
  }
}

export { Solution }
