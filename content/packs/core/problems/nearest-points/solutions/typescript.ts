class Solution {
  closestPoints(points: number[][], k: number): number[][] {
    return points
      .map((point) => ({
        point,
        distance: point[0] * point[0] + point[1] * point[1],
      }))
      .sort(
        (left, right) =>
          left.distance - right.distance ||
          left.point[0] - right.point[0] ||
          left.point[1] - right.point[1],
      )
      .slice(0, k)
      .map((entry) => entry.point)
  }
}

export { Solution }
