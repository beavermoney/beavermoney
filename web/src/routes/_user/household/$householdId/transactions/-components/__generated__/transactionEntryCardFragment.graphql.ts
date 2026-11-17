/**
 * @generated SignedSource<<0b09e42c3a1a3cc6a064d3938fe2c53a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type transactionEntryCardFragment$data = {
  readonly account: {
    readonly householdCurrency: {
      readonly code: string;
    };
    readonly name: string;
  };
  readonly amount: string;
  readonly id: string;
  readonly transaction: {
    readonly category: {
      readonly icon: string;
      readonly name: string;
      readonly type: TransactionCategoryType;
    };
    readonly datetime: any;
    readonly excludeFromReports: boolean;
    readonly id: string;
    readonly pending: boolean;
  };
  readonly " $fragmentType": "transactionEntryCardFragment";
};
export type transactionEntryCardFragment$key = {
  readonly " $data"?: transactionEntryCardFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"transactionEntryCardFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "transactionEntryCardFragment",
  "selections": [
    (v0/*: any*/),
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
        (v1/*: any*/),
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Transaction",
      "kind": "LinkedField",
      "name": "transaction",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "pending",
          "storageKey": null
        },
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
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "type",
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
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "datetime",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "TransactionEntry",
  "abstractKey": null
};
})();

(node as any).hash = "61c77dd3cd87e587368490a9e6089832";

export default node;
