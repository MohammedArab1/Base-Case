# Cheerful Digits

Define a digit step on a positive integer: replace the number with the sum of the squares of its decimal digits.

Starting from `value`, repeat this step. The number is cheerful if the process reaches `1`. If it never reaches `1`, it eventually repeats a value and is not cheerful.

Return whether `value` is cheerful.

## Input

- `value`: a positive integer.

## Output

Return `true` if repeated digit-square steps eventually reach `1`; otherwise return `false`.

## Examples

**Example 1**

```
Input: value = 23
Output: true
```

**Example 2**

```
Input: value = 5
Output: false
```

**Example 3**

```
Input: value = 1
Output: true
```

**Example 4**

```
Input: value = 4
Output: false
```

## Constraints

- `1 <= value <= 2,147,483,647`

## Follow-up

Which values form the non-cheerful cycle, and can you detect it without a set?
