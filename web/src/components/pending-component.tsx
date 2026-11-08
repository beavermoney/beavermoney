import { Heading } from '@astryxdesign/core/Heading'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Stack } from '@astryxdesign/core/Stack'
export function PendingComponent() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={2}>
        <Stack direction="vertical" gap={4}>
          <Spinner />
        </Stack>
        <Heading level={2}>Loading...</Heading>
        {/* <EmptyDescription> */}
        {/*   Please wait while we process your request. Do not refresh the page. */}
        {/* </EmptyDescription> */}
      </Stack>
      {/* <EmptyContent> */}
      {/*   <Button variant="outline" size="sm"> */}
      {/*     Cancel */}
      {/*   </Button> */}
      {/* </EmptyContent> */}
    </Stack>
  )
}
