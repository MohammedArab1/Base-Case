class Solution {
  compactSignals(signals: number[]): number {
    if (signals.length === 0) {
      return 0
    }

    let write = 1

    for (let read = 1; read < signals.length; read += 1) {
      if (signals[read] !== signals[write - 1]) {
        signals[write] = signals[read]
        write += 1
      }
    }

    signals.length = write
    return write
  }
}

export { Solution }
