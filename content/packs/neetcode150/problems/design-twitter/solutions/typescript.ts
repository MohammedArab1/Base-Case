class Solution {
  twitterFeed(operations: string[], arguments_: number[][]): number[][] {
    const followees = new Map<number, Set<number>>()
    const timeline: Array<[number, number]> = []
    const feeds: number[][] = []

    for (let index = 0; index < operations.length; index += 1) {
      const operation = operations[index]
      const values = arguments_[index]

      if (operation === 'post') {
        timeline.push([values[0], values[1]])
      } else if (operation === 'follow') {
        const follower = values[0]
        const followee = values[1]
        if (follower !== followee) {
          let targets = followees.get(follower)
          if (targets === undefined) {
            targets = new Set<number>()
            followees.set(follower, targets)
          }
          targets.add(followee)
        }
      } else if (operation === 'unfollow') {
        const follower = values[0]
        const followee = values[1]
        followees.get(follower)?.delete(followee)
      } else {
        const user = values[0]
        const visible = followees.get(user)
        const feed: number[] = []

        for (let post = timeline.length - 1; post >= 0; post -= 1) {
          const [author, tweet] = timeline[post]
          if (author === user || (visible !== undefined && visible.has(author))) {
            feed.push(tweet)
            if (feed.length === 10) {
              break
            }
          }
        }

        feeds.push(feed)
      }
    }

    return feeds
  }
}

export { Solution }
