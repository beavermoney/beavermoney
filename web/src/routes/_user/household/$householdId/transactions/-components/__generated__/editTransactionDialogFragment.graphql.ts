/**
 * @generated SignedSource<<3be6815fbea9cc27e8075f082af92c50>>
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
    readonly amount: string;
    readonly id: string;
    readonly investment: {
      readonly currency: {
        readonly code: string;
      };
      readonly name: string;
      readonly symbol: string;
    };
    readonly price: string;
    readonly " $fragmentSpreads": FragmentRefs<"investmentLotCardFragment">;
  }> | null | undefined;
  readonly transactionEntries: ReadonlyArray<{
    readonly account: {
      readonly currency: {
        readonly code: string;
      };
      readonly name: string;
    };
    readonly amount: string;
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
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "amount",
  "storageKey": null
},
v3 = {
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
        (v0/*: any*/),
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "price",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "Investment",
          "kind": "LinkedField",
          "name": "investment",
          "plural": false,
          "selections": [
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "symbol",
              "storageKey": null
            },
            (v3/*: any*/)
          ],
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "transactionEntryCardFragment"
        },
        (v0/*: any*/),
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "Account",
          "kind": "LinkedField",
          "name": "account",
          "plural": false,
          "selections": [
            (v1/*: any*/),
            (v3/*: any*/)
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
})();

(node as any).hash = "ab238382bafa9b001573cab2b876455d";

export default node;
