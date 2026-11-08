/**
 * @generated SignedSource<<5ca57de17c9ea1816cab35c76d5f7f63>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type householdSwitcherFragment$data = {
  readonly households: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }>;
  readonly user: {
    readonly email: string | null | undefined;
    readonly name: string;
  };
  readonly " $fragmentType": "householdSwitcherFragment";
};
export type householdSwitcherFragment$key = {
  readonly " $data"?: householdSwitcherFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"householdSwitcherFragment">;
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
  "name": "householdSwitcherFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "email",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Household",
      "kind": "LinkedField",
      "name": "households",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
        (v0/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "1307584116c5ac3f51c3491ed6f405d2";

export default node;
