/**
 * @generated SignedSource<<e3e2c42df5e1bc7de96e5b25a43e99d5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AccountType = "investment" | "liability" | "liquidity" | "property" | "receivable" | "%future added value";
export type InvestmentType = "crypto" | "stock" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type accountLedgerRowFragment$data = {
  readonly balance: string;
  readonly household: {
    readonly householdRates: ReadonlyArray<{
      readonly fromCurrency: {
        readonly code: string;
      };
      readonly rate: string;
      readonly toCurrency: {
        readonly code: string;
      };
    }> | null | undefined;
  };
  readonly householdCurrency: {
    readonly code: string;
  };
  readonly icon: string | null | undefined;
  readonly id: string;
  readonly investments: ReadonlyArray<{
    readonly amount: string;
    readonly householdCurrency: {
      readonly code: string;
    };
    readonly id: string;
    readonly name: string;
    readonly symbol: string;
    readonly type: InvestmentType;
    readonly value: string;
  }> | null | undefined;
  readonly latestTransaction: {
    readonly datetime: any;
  } | null | undefined;
  readonly name: string;
  readonly type: AccountType;
  readonly user: {
    readonly name: string;
  };
  readonly value: string;
  readonly " $fragmentType": "accountLedgerRowFragment";
};
export type accountLedgerRowFragment$key = {
  readonly " $data"?: accountLedgerRowFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"accountLedgerRowFragment">;
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
  "name": "type",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "code",
    "storageKey": null
  }
],
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "HouseholdCurrency",
  "kind": "LinkedField",
  "name": "householdCurrency",
  "plural": false,
  "selections": (v4/*: any*/),
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "accountLedgerRowFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "icon",
      "storageKey": null
    },
    (v3/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "balance",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Investment",
      "kind": "LinkedField",
      "name": "investments",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "symbol",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "amount",
          "storageKey": null
        },
        (v3/*: any*/),
        (v5/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Household",
      "kind": "LinkedField",
      "name": "household",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "HouseholdRate",
          "kind": "LinkedField",
          "name": "householdRates",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "rate",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "HouseholdCurrency",
              "kind": "LinkedField",
              "name": "fromCurrency",
              "plural": false,
              "selections": (v4/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "HouseholdCurrency",
              "kind": "LinkedField",
              "name": "toCurrency",
              "plural": false,
              "selections": (v4/*: any*/),
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
      "name": "latestTransaction",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "datetime",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v5/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        (v1/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "Account",
  "abstractKey": null
};
})();

(node as any).hash = "2a134e36a439f950bd56ba2e0f317154";

export default node;
