class Solution {
  medianOperations(operations: string[], values: number[]): number[] {
    const numbers: number[] = []
    const medians: number[] = []

    for (let index = 0; index < operations.length; index += 1) {
      const operation = operations[index]
      const value = values[index]

      if (operation === 'addNum') {
        let low = 0
        let high = numbers.length
        while (low < high) {
          const middle = Math.floor((low + high) / 2)
          if (numbers[middle] < value) {
            low = middle + 1
          } else {
            high = middle
          }
        }
        numbers.splice(low, 0, value)
      } else {
        const size = numbers.length
        if (size % 2 === 1) {
          medians.push(numbers[Math.floor(size / 2)])
        } else {
          medians.push((numbers[size / 2 - 1] + numbers[size / 2]) / 2)
        }
      }
    }

    return medians
  }
}

export { Solution }
