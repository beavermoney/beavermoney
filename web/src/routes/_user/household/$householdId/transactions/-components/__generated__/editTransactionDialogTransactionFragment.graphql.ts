/**
 * @generated SignedSource<<67f1aba37192f7c0447054dcdfe76851>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type editTransactionDialogTransactionFragment$data = {
  readonly category: {
    readonly id: string;
    readonly name: string;
    readonly type: TransactionCategoryType;
  };
  readonly categoryID: string;
  readonly datetime: any;
  readonly description: string | null | undefined;
  readonly excludeFromReports: boolean;
  readonly id: string;
  readonly investmentLots: ReadonlyArray<{
    readonly amount: string;
    readonly id: string;
    readonly investment: {
      readonly account: {
        readonly id: string;
      };
      readonly id: string;
    };
    readonly price: string;
    readonly " $fragmentSpreads": FragmentRefs<"investmentLotCardFragment">;
  }> | null | undefined;
  readonly merchant: {
    readonly icon: string | null | undefined;
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly pending: boolean;
  readonly transactionEntries: ReadonlyArray<{
    readonly account: {
      readonly id: string;
    };
    readonly amount: string;
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"transactionEntryCardFragment">;
  }> | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"mobileEditTransactionFragment">;
  readonly " $fragmentType": "editTransactionDialogTransactionFragment";
};
export type editTransactionDialogTransactionFragment$key = {
  readonly " $data"?: editTransactionDialogTransactionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"editTransactionDialogTransactionFragment">;
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
  "concreteType": "Account",
  "kind": "LinkedField",
  "name": "account",
  "plural": false,
  "selections": [
    (v0/*: any*/)
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "editTransactionDialogTransactionFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "mobileEditTransactionFragment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Merchant",
      "kind": "LinkedField",
      "name": "merchant",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
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
      "kind": "ScalarField",
      "name": "excludeFromReports",
      "storageKey": null
    },
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
            (v0/*: any*/),
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
        (v3/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "Transaction",
  "abstractKey": null
};
})();

(node as any).hash = "8aab326b05444092accfe99b8dec7630";

export default node;
