export default function ServerSideRenderedContent(props: {
  model: {
    error: Error | undefined
    reload: () => void
    message: string | undefined
    filled: boolean
  }
}): JSX.Element
