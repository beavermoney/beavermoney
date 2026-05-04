import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import type { transactionDetailFragment$key } from './__generated__/transactionDetailFragment.graphql'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
    return <div>Transaction not found</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>CATEGORY</CardTitle>
        <CardDescription>{data.node.description}</CardDescription>
        <CardAction>{new Date(data.node.datetime).toDateString()}</CardAction>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  )
}
