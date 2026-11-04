class Solution {
  carFleet(target: number, position: number[], speed: number[]): number {
    const cars = position.map((start, index) => [start, speed[index]] as [number, number])
    cars.sort((first, second) => second[0] - first[0])

    let fleets = 0
    let slowestArrival = 0

    for (const [start, rate] of cars) {
      const arrival = (target - start) / rate
      if (arrival > slowestArrival) {
        fleets += 1
        slowestArrival = arrival
      }
    }

    return fleets
  }
}

export { Solution }
