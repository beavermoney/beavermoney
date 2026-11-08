import { Card } from '@astryxdesign/core/Card'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'
import type { transactionDetailFragment$key } from './__generated__/transactionDetailFragment.graphql'

const transactionDetailFragment = graphql`
  fragment transactionDetailFragment on Query
  @argumentDefinitions(id: { type: "ID!" }) {
    node(id: $id) {
      ... on Transaction {
        # id
        datetime
        description
        # transactionEntries {
        #   account {
        #     name
        #   }
        # }
      }
    }
  }
`

type TransactionDetailProps = {
  fragmentRef: transactionDetailFragment$key
}

export function TransactionDetail({ fragmentRef }: TransactionDetailProps) {
  const data = useFragment(transactionDetailFragment, fragmentRef)

  if (data.node == null) {
    return (
      <Stack direction="vertical" gap={4}>
        Transaction not found
      </Stack>
    )
  }

  return (
    <Card>
      <Stack direction="vertical" gap={2} as="header">
        <Heading level={2}>CATEGORY</Heading>
        <Stack direction="vertical" gap={4}>
          {data.node.description}
        </Stack>
        <Stack direction="vertical" gap={4}>
          {new Date(data.node.datetime).toDateString()}
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <Text as="p" display="block">
          Card Content
        </Text>
      </Stack>
      <Stack
        direction="horizontal"
        gap={3}
        align="center"
        wrap="wrap"
        justify="end"
        as="footer"
      >
        <Text as="p" display="block">
          Card Footer
        </Text>
      </Stack>
    </Card>
  )
}
