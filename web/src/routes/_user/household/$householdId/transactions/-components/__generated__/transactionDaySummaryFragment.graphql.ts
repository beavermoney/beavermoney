/**
 * @generated SignedSource<<30614134345863b835418aaac99afd49>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type transactionDaySummaryFragment$data = ReadonlyArray<{
  readonly category: {
    readonly type: TransactionCategoryType;
  };
  readonly excludeFromReports: boolean;
  readonly transactionEntries: ReadonlyArray<{
    readonly account: {
      readonly householdCurrency: {
        readonly code: string;
      };
      readonly user: {
        readonly id: string;
      };
    };
    readonly amount: string;
  }> | null | undefined;
  readonly " $fragmentType": "transactionDaySummaryFragment";
}>;
export type transactionDaySummaryFragment$key = ReadonlyArray<{
  readonly " $data"?: transactionDaySummaryFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"transactionDaySummaryFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "transactionDaySummaryFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "excludeFromReports",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TransactionCategory",
      "kind": "LinkedField",
      "name": "category",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "type",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TransactionEntry",
      "kind": "LinkedField",
      "name": "transactionEntries",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "amount",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "Account",
          "kind": "LinkedField",
          "name": "account",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "user",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "HouseholdCurrency",
              "kind": "LinkedField",
              "name": "householdCurrency",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "code",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Transaction",
  "abstractKey": null
};

(node as any).hash = "c5ee51b3f32bd74b64667ff6a80ff9bd";

export default node;
