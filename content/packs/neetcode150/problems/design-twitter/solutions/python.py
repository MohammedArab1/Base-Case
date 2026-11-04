from typing import List


class Solution:
    def twitterFeed(self, operations: List[str], arguments: List[List[int]]) -> List[List[int]]:
        followees = {}
        timeline = []
        feeds = []

        for operation, values in zip(operations, arguments):
            if operation == "post":
                user, tweet = values
                timeline.append((user, tweet))
            elif operation == "follow":
                follower, followee = values
                if follower != followee:
                    followees.setdefault(follower, set()).add(followee)
            elif operation == "unfollow":
                follower, followee = values
                if follower in followees:
                    followees[follower].discard(followee)
            else:
                user = values[0]
                visible = followees.get(user, set())
                feed = []
                for author, tweet in reversed(timeline):
                    if author == user or author in visible:
                        feed.append(tweet)
                        if len(feed) == 10:
                            break
                feeds.append(feed)

        return feeds
