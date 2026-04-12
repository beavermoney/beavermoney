/**
 * @generated SignedSource<<93076e1e3411c61bf5931779276ec9dc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useHouseholdFragment$data = {
  readonly currencyCode: string;
  readonly householdCurrencies: ReadonlyArray<{
    readonly code: string;
    readonly id: string;
  }> | null | undefined;
  readonly id: string;
  readonly locale: string;
  readonly name: string;
  readonly " $fragmentType": "useHouseholdFragment";
};
export type useHouseholdFragment$key = {
  readonly " $data"?: useHouseholdFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useHouseholdFragment">;
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
  "name": "useHouseholdFragment",
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
      "name": "locale",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "currencyCode",
      "storageKey": null
    },
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
          "name": "code",
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

(node as any).hash = "e7594c70b45a3ac1b218b78dfc9c3aa8";

export default node;
