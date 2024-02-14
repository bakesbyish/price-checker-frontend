// https://developer.mozilla.org/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
// biome-ignore lint/suspicious/noExplicitAny:
export function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()

      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })
}

