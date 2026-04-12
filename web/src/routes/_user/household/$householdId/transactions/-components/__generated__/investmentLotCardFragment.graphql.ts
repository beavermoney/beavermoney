/**
 * @generated SignedSource<<ef745f5fca6d284190c1cac74351cb28>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type investmentLotCardFragment$data = {
  readonly amount: string;
  readonly id: string;
  readonly investment: {
    readonly householdCurrency: {
      readonly code: string;
    };
    readonly name: string;
    readonly symbol: string;
  };
  readonly price: string;
  readonly transaction: {
    readonly category: {
      readonly name: string;
    };
    readonly datetime: any;
    readonly id: string;
  };
  readonly " $fragmentType": "investmentLotCardFragment";
};
export type investmentLotCardFragment$key = {
  readonly " $data"?: investmentLotCardFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"investmentLotCardFragment">;
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
  "name": "investmentLotCardFragment",
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
          "concreteType": "TransactionCategory",
          "kind": "LinkedField",
          "name": "category",
          "plural": false,
          "selections": [
            (v1/*: any*/)
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
  "type": "InvestmentLot",
  "abstractKey": null
};
})();

(node as any).hash = "7eba68caa5ca988dfc34db0128a2372a";

export default node;
