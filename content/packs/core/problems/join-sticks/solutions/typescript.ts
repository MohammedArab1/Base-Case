class Solution {
  connectCost(sticks: number[]): number {
    if (sticks.length <= 1) {
      return 0
    }

    const heap = [...sticks].sort((left, right) => left - right)

    const push = (value: number): void => {
      heap.push(value)
      let index = heap.length - 1

      while (index > 0) {
        const parent = (index - 1) >> 1
        if (heap[parent] <= heap[index]) {
          break
        }
        ;[heap[parent], heap[index]] = [heap[index], heap[parent]]
        index = parent
      }
    }

    const pop = (): number => {
      const top = heap[0]
      const last = heap.pop() as number

      if (heap.length > 0) {
        heap[0] = last
        let index = 0

        while (true) {
          const left = index * 2 + 1
          const right = left + 1
          let smallest = index

          if (left < heap.length && heap[left] < heap[smallest]) {
            smallest = left
          }
          if (right < heap.length && heap[right] < heap[smallest]) {
            smallest = right
          }
          if (smallest === index) {
            break
          }

          ;[heap[index], heap[smallest]] = [heap[smallest], heap[index]]
          index = smallest
        }
      }

      return top
    }

    let total = 0

    while (heap.length > 1) {
      const combined = pop() + pop()
      total += combined
      push(combined)
    }

    return total
  }
}

export { Solution }
