/**
 * @generated SignedSource<<748afe749d883b568fc075dff756ca94>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type transactionDaySummaryFragment$data = ReadonlyArray<{
  readonly " $fragmentSpreads": FragmentRefs<"transactionDayTotalsFragment">;
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
      "kind": "InlineDataFragmentSpread",
      "name": "transactionDayTotalsFragment",
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
      "args": null,
      "argumentDefinitions": []
    }
  ],
  "type": "Transaction",
  "abstractKey": null
};

(node as any).hash = "07d1e626d552f65a215dc039389203fe";

export default node;
