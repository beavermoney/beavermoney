/**
 * @generated SignedSource<<99a201ece2f27d88cbdd3c271aca81fb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type editTransactionDialogCategoriesFragment$data = {
  readonly transactionCategories: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly type: TransactionCategoryType;
        readonly " $fragmentSpreads": FragmentRefs<"transactionCategoryPickerFragment">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "editTransactionDialogCategoriesFragment";
};
export type editTransactionDialogCategoriesFragment$key = {
  readonly " $data"?: editTransactionDialogCategoriesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"editTransactionDialogCategoriesFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "editTransactionDialogCategoriesFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "TransactionCategoryConnection",
      "kind": "LinkedField",
      "name": "transactionCategories",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "TransactionCategoryEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "TransactionCategory",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "type",
                  "storageKey": null
                },
                {
                  "kind": "InlineDataFragmentSpread",
                  "name": "transactionCategoryPickerFragment",
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "name",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "icon",
                      "storageKey": null
                    }
                  ],
                  "args": null,
                  "argumentDefinitions": []
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
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "04e18dbcd599dbbe098408c9a9ea017e";

export default node;
