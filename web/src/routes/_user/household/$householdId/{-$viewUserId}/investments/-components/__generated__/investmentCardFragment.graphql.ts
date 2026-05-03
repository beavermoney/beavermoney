/**
 * @generated SignedSource<<b6ec6aab1ac6a450dc13eb4914be923a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type investmentCardFragment$data = {
  readonly amount: string;
  readonly householdCurrency: {
    readonly code: string;
  };
  readonly id: string;
  readonly name: string;
  readonly quote: string;
  readonly symbol: string;
  readonly unrealizedReturn: string;
  readonly unrealizedReturnPercent: string;
  readonly updateTime: any;
  readonly user: {
    readonly name: string;
  };
  readonly value: string;
  readonly " $fragmentType": "investmentCardFragment";
};
export type investmentCardFragment$key = {
  readonly " $data"?: investmentCardFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"investmentCardFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
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
  "name": "investmentCardFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    (v0/*: any*/),
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
      "name": "quote",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "updateTime",
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        (v0/*: any*/)
      ],
      "storageKey": null
    },
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
      "name": "value",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unrealizedReturn",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unrealizedReturnPercent",
      "storageKey": null
    }
  ],
  "type": "Investment",
  "abstractKey": null
};
})();

(node as any).hash = "7670a93cacf9dbe9e0adeb9f3f626b5f";

export default node;
