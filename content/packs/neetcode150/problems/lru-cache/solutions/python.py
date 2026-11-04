from collections import OrderedDict


class Solution:
    def lruCache(
        self,
        capacity: int,
        operations: list[str],
        keys: list[int],
        values: list[int],
    ) -> list[int]:
        cache: OrderedDict[int, int] = OrderedDict()
        answers: list[int] = []

        for operation, key, value in zip(operations, keys, values):
            if operation == "get":
                if key not in cache:
                    answers.append(-1)
                else:
                    cache.move_to_end(key)
                    answers.append(cache[key])
            else:
                if key in cache:
                    cache.move_to_end(key)
                elif len(cache) >= capacity:
                    cache.popitem(last=False)
                cache[key] = value

        return answers
