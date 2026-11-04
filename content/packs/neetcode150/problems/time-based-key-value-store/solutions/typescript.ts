class Solution {
  timeMap(operations: string[], keys: string[], values: string[], times: number[]): string[] {
    const history = new Map<string, Array<[number, string]>>()
    const answers: string[] = []

    for (let index = 0; index < operations.length; index += 1) {
      const operation = operations[index]
      const key = keys[index]

      if (operation === 'set') {
        const records = history.get(key)
        if (records) {
          records.push([times[index], values[index]])
        } else {
          history.set(key, [[times[index], values[index]]])
        }
        continue
      }

      const records = history.get(key)
      if (!records || records.length === 0) {
        answers.push('')
        continue
      }

      let low = 0
      let high = records.length
      while (low < high) {
        const mid = Math.floor((low + high) / 2)
        if (records[mid][0] <= times[index]) {
          low = mid + 1
        } else {
          high = mid
        }
      }

      answers.push(low > 0 ? records[low - 1][1] : '')
    }

    return answers
  }
}

export { Solution }
