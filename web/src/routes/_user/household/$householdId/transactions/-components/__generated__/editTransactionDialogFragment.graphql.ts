/**
 * @generated SignedSource<<cc3417a1d8c358674276ab481535a721>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type editTransactionDialogFragment$data = {
  readonly category: {
    readonly icon: string;
    readonly id: string;
    readonly name: string;
    readonly type: TransactionCategoryType;
  };
  readonly categoryID: string;
  readonly datetime: any;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly investmentLots: ReadonlyArray<{
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"investmentLotCardFragment">;
  }> | null | undefined;
  readonly transactionEntries: ReadonlyArray<{
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"transactionEntryCardFragment">;
  }> | null | undefined;
  readonly " $fragmentType": "editTransactionDialogFragment";
};
export type editTransactionDialogFragment$key = {
  readonly " $data"?: editTransactionDialogFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"editTransactionDialogFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "editTransactionDialogFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "datetime",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "categoryID",
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
        (v0/*: any*/),
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
      "concreteType": "InvestmentLot",
      "kind": "LinkedField",
      "name": "investmentLots",
      "plural": true,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "investmentLotCardFragment"
        },
        (v0/*: any*/)
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "transactionEntryCardFragment"
        },
        (v0/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "Transaction",
  "abstractKey": null
};
})();

(node as any).hash = "87ab2a256bbb805495d189172942c833";

export default node;
