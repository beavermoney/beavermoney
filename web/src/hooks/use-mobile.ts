import { useScreenSize } from './use-screen-size'

export function useIsMobile() {
  const size = useScreenSize()
  return size.lessThan('md')
}
