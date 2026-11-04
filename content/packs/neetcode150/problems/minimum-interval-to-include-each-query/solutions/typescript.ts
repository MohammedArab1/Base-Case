class Solution {
  smallestSpans(intervals: number[][], queries: number[]): number[] {
    const ordered = [...intervals].sort((left, right) => left[0] - right[0])
    const queryOrder = queries
      .map((_, index) => index)
      .sort((left, right) => queries[left] - queries[right])
    const answers = new Array<number>(queries.length).fill(-1)
    const heap: number[][] = []

    const push = (length: number, end: number): void => {
      heap.push([length, end])
      let index = heap.length - 1

      while (index > 0) {
        const parent = (index - 1) >> 1

        if (heap[parent][0] <= heap[index][0]) {
          break
        }

        const temporary = heap[parent]
        heap[parent] = heap[index]
        heap[index] = temporary
        index = parent
      }
    }

    const pop = (): number[] => {
      const top = heap[0]
      const last = heap.pop() as number[]

      if (heap.length > 0) {
        heap[0] = last
        let index = 0

        while (true) {
          const left = index * 2 + 1
          const right = left + 1
          let smallest = index

          if (left < heap.length && heap[left][0] < heap[smallest][0]) {
            smallest = left
          }
          if (right < heap.length && heap[right][0] < heap[smallest][0]) {
            smallest = right
          }
          if (smallest === index) {
            break
          }

          const temporary = heap[index]
          heap[index] = heap[smallest]
          heap[smallest] = temporary
          index = smallest
        }
      }

      return top
    }

    let nextInterval = 0

    for (const queryIndex of queryOrder) {
      const query = queries[queryIndex]

      while (nextInterval < ordered.length && ordered[nextInterval][0] <= query) {
        const [start, end] = ordered[nextInterval]
        push(end - start + 1, end)
        nextInterval += 1
      }

      while (heap.length > 0 && heap[0][1] < query) {
        pop()
      }

      if (heap.length > 0) {
        answers[queryIndex] = heap[0][0]
      }
    }

    return answers
  }
}

export { Solution }
