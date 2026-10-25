class MinHeap {
  private readonly data: number[] = []

  get size(): number {
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

      const temporary = this.data[parent]
      this.data[parent] = this.data[index]
      this.data[index] = temporary
      index = parent
    }
  }

  pop(): number {
    const top = this.data[0]
    const last = this.data.pop()

    if (this.data.length > 0 && last !== undefined) {
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

        const temporary = this.data[smallest]
        this.data[smallest] = this.data[index]
        this.data[index] = temporary
        index = smallest
      }
    }

    return top
  }
}

class Solution {
  findKthLargest(nums: number[], k: number): number {
    const heap = new MinHeap()

    for (const value of nums) {
      heap.push(value)
      if (heap.size > k) {
        heap.pop()
      }
    }

    return heap.peek()
  }
}

export { Solution }
