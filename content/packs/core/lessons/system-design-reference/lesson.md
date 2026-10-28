# System Design Cheat Sheet

An interview estimate is not an accounting exercise. It is a quick check that the design is the right order of magnitude. Keep a few conversions and tables in your head, state your assumptions, and round aggressively.

## How to use this page

1. Write the assumption down.
2. Round to one or two significant digits.
3. Check the units before comparing numbers.
4. Use the result to choose a component, not to prove precision.

```text
wrong: "exactly 1,157.407 requests per second"
right: "about 1,200 requests per second on average, 3,500 at peak"
```

## Powers of two

| Power | Approximate value | Convenient name    |
| ----- | ----------------- | ------------------ |
| 2^10  | 1,024             | about one thousand |
| 2^16  | 65,536            | about 64 thousand  |
| 2^20  | 1,048,576         | about one million  |
| 2^30  | 1,073,741,824     | about one billion  |
| 2^32  | 4,294,967,296     | about 4.3 billion  |
| 2^40  | 1,099,511,627,776 | about one trillion |

Memory and storage sizes use these powers:

```text
1 KB = 2^10 bytes
1 MB = 2^20 bytes
1 GB = 2^30 bytes
1 TB = 2^40 bytes
```

A useful shortcut: 1 KB × 1 million is about 1 GB. 1 MB × 1 million is about 1 TB.

## Time units

```text
1 second      = 1,000 milliseconds
1 millisecond = 1,000 microseconds
1 microsecond = 1,000 nanoseconds
```

Conversions worth memorizing:

```text
seconds per day    = 86,400
seconds per month  = about 2.6 million   (30 days)
seconds per year   = about 31.5 million  (365 days)
```

## A latency ladder

These are order-of-magnitude estimates, not guarantees. Hardware, virtualization, and network conditions move them.

| Operation                        | Rough time   |
| -------------------------------- | ------------ |
| CPU cache reference              | about 1 ns   |
| Main memory reference            | about 100 ns |
| Read a small block from SSD      | about 100 µs |
| Round trip within one datacenter | about 0.5 ms |
| Disk seek on a spinning disk     | about 10 ms  |
| Round trip across an ocean       | about 150 ms |

Use the ladder to sanity-check a budget:

```text
one cross-region call   ~150 ms
three sequential calls  ~450 ms before any work
```

That is why chatty cross-region designs are expensive and why caches are placed near readers.

## From users to QPS

```text
average QPS = daily actions / 86,400
peak QPS    ≈ average QPS × peak factor
```

Peak factors vary by product. A multiplier of 2 to 5 is a common starting assumption; state it rather than hiding it.

```text
10,000,000 daily users
× 10 reads per user per day
= 100,000,000 reads per day

100,000,000 / 86,400 ≈ 1,157 reads/s average
× 3 peak factor     ≈ 3,500 reads/s at peak
```

## Storage growth

```text
bytes per day = writes per day × bytes per record
total bytes   = bytes per day × retention days × replication factor
```

```text
1,000,000 records/day × 500 bytes = 500 MB/day
500 MB/day × 365 days             ≈ 182 GB/year
× 3 replicas                      ≈ 547 GB/year
```

Indexes, metadata, and backups add more. A 20-50% overhead is a reasonable early assumption.

## Bandwidth

```text
bandwidth = requests per second × response size
```

```text
2,000 requests/s × 100 KB = 200,000 KB/s
                           ≈ 200 MB/s
                           ≈ 1.6 Gbps
```

Remember the factor of eight between bytes and bits. Network links are usually described in bits per second.

## Availability at a glance

| Target  | Downtime per year | Downtime per month | Downtime per day |
| ------- | ----------------- | ------------------ | ---------------- |
| 99%     | 3.65 days         | 7.2 hours          | 14.4 minutes     |
| 99.9%   | 8.76 hours        | 43.8 minutes       | 86 seconds       |
| 99.99%  | 52.6 minutes      | 4.4 minutes        | 8.6 seconds      |
| 99.999% | 5.3 minutes       | 26 seconds         | 0.9 seconds      |

For components in sequence, multiply availability. For independent components in parallel:

```text
parallel availability = 1 - product(1 - component availability)
```

## Capacity headroom

A system designed to run at 100% at peak has no room for a failure, a deploy, or a burst.

```text
target utilization at peak   50-70%
redundancy                   at least one extra instance per tier
replication                  2-3 copies for important data
growth buffer                25-50% for the next planning period
```

Headroom is not waste. It is the space that turns a failure into a slowdown instead of an outage.

## A worked estimate: photo app

Assume:

```text
5,000,000 daily active users
10% upload 2 photos per week
each photo is 2 MB
each user views 20 photos per day
each viewed image is 200 KB
```

Uploads:

```text
5,000,000 × 0.10 × 2 = 1,000,000 photos/week
1,000,000 / 7         ≈ 143,000 photos/day
143,000 × 2 MB        ≈ 286 GB/day
286 GB × 365          ≈ 104 TB/year raw
× 3 replicas          ≈ 313 TB/year
```

Reads:

```text
5,000,000 × 20 = 100,000,000 views/day
100,000,000 / 86,400 ≈ 1,157 views/s average
× 3 peak             ≈ 3,500 views/s
3,500 × 200 KB       ≈ 700 MB/s
≈ 5.6 Gbps at peak
```

What the numbers say:

- 313 TB per year is too much for one database volume, so the images belong in object storage with metadata elsewhere.
- 5.6 Gbps of image traffic is a strong case for a CDN.
- 3,500 peak reads/s is manageable for a cache in front of metadata, but not for a single unindexed table scan.
- Upload bandwidth is modest on average, but the storage growth and durability requirements drive the design.

## The one-page summary

```text
QPS        = daily actions / 86,400, then × peak factor
storage    = writes/day × record size × retention × replicas
bandwidth  = QPS × response size × 8 bits
1 KB × 1M  ≈ 1 GB
1 MB/s     ≈ 86 GB/day
sequence   = multiply availability
parallel   = 1 - product(1 - availability)
budget     = add every hop, including DNS, TLS, and retries
```

## What it costs

- Mixing bytes and bits gives answers that are wrong by a factor of eight.
- Forgetting replication and indexes underestimates storage.
- Using average traffic instead of peak underprovisions the system.
- Too many significant digits suggest false precision.
- A latency budget that omits DNS, TLS, and retries is not a real budget.

## What to say in an interview

> "At 100 million reads per day, the average is about 1,200 per second and the peak is around 3,500 at a 3x factor. With a 200 KB image, that is roughly 5.6 Gbps at peak, so images go to a CDN and object storage. Metadata is about 300 GB per year before replicas, which fits a relational primary with an index on the lookup key."

That turns three rounded numbers into concrete component choices.
