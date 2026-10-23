package judge

import (
	"bytes"
	"errors"
	"sync"
)

var errOutputLimit = errors.New("output limit exceeded")

type cappedBuffer struct {
	mu       sync.Mutex
	buffer   bytes.Buffer
	limit    int
	overflow chan struct{}
	once     sync.Once
}

func newCappedBuffer(limit int) (*cappedBuffer, <-chan struct{}) {
	overflow := make(chan struct{})
	return &cappedBuffer{limit: limit, overflow: overflow}, overflow
}

func (b *cappedBuffer) Write(data []byte) (int, error) {
	b.mu.Lock()
	defer b.mu.Unlock()

	remaining := b.limit - b.buffer.Len()
	if remaining <= 0 {
		b.signalOverflow()
		return 0, errOutputLimit
	}

	if len(data) > remaining {
		written, err := b.buffer.Write(data[:remaining])
		b.signalOverflow()
		if err != nil {
			return written, err
		}
		return written, errOutputLimit
	}

	return b.buffer.Write(data)
}

func (b *cappedBuffer) String() string {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.buffer.String()
}

func (b *cappedBuffer) signalOverflow() {
	b.once.Do(func() {
		close(b.overflow)
	})
}
