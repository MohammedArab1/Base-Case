class MinHeap {
  private data: number[] = []

  size(): number {
    return this.data.length
  }

  peek(): number {
    return this.data[0]
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
  lastStoneWeight(stones: number[]): number {
    const heap = new MinHeap()
    for (const stone of stones) {
      heap.push(-stone)
    }

    while (heap.size() >= 2) {
      const first = -heap.pop()
      const second = -heap.pop()
      if (first !== second) {
        heap.push(-(first - second))
      }
    }

    return heap.size() === 0 ? 0 : -heap.peek()
  }
}

export { Solution }
