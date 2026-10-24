# Explanation

The identity function returns its input unchanged. There is no state to keep and no work that depends on the value, so both time and space are constant.

```python
class Solution:
    def echo(self, value: int) -> int:
        return value
```
