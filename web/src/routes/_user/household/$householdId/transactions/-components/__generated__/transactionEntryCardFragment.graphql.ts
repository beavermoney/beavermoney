/**
 * @generated SignedSource<<492c13bd537e6e1cd257705ea363f072>>
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
    readonly currency: {
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
          "concreteType": "Currency",
          "kind": "LinkedField",
          "name": "currency",
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

(node as any).hash = "867caab77fa05f244a722b2a840863a4";

export default node;
