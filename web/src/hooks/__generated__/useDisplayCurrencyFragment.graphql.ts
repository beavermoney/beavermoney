/**
 * @generated SignedSource<<9fc3841be8bfb2095befa3fc7ce0f52d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useDisplayCurrencyFragment$data = {
  readonly householdCurrencies: ReadonlyArray<{
    readonly code: string;
    readonly id: string;
    readonly important: boolean;
  }> | null | undefined;
  readonly householdRates: ReadonlyArray<{
    readonly fromCurrency: {
      readonly code: string;
    };
    readonly rate: string;
    readonly toCurrency: {
      readonly code: string;
    };
  }> | null | undefined;
  readonly userHouseholds: ReadonlyArray<{
    readonly householdCurrency: {
      readonly code: string;
    };
    readonly user: {
      readonly id: string;
    };
  }> | null | undefined;
  readonly " $fragmentType": "useDisplayCurrencyFragment";
};
export type useDisplayCurrencyFragment$key = {
  readonly " $data"?: useDisplayCurrencyFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useDisplayCurrencyFragment">;
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
  "name": "code",
  "storageKey": null
},
v2 = [
  (v1/*: any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useDisplayCurrencyFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "HouseholdCurrency",
      "kind": "LinkedField",
      "name": "householdCurrencies",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "important",
          "storageKey": null
        },
        (v1/*: any*/)
      ],
      "storageKey": null
    },
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
          "selections": (v2/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "HouseholdCurrency",
          "kind": "LinkedField",
          "name": "toCurrency",
          "plural": false,
          "selections": (v2/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserHousehold",
      "kind": "LinkedField",
      "name": "userHouseholds",
      "plural": true,
      "selections": [
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
          "concreteType": "HouseholdCurrency",
          "kind": "LinkedField",
          "name": "householdCurrency",
          "plural": false,
          "selections": (v2/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Household",
  "abstractKey": null
};
})();

(node as any).hash = "88f3c0d52a5e20fd4cc11527c74ef21a";

export default node;
