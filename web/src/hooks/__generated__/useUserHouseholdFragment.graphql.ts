/**
 * @generated SignedSource<<04d5bf2cb7b319c935fdcb14d0f698ed>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type UserHouseholdRole = "admin" | "member" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type useUserHouseholdFragment$data = {
  readonly householdCurrency: {
    readonly code: string;
    readonly id: string;
  };
  readonly id: string;
  readonly role: UserHouseholdRole;
  readonly " $fragmentType": "useUserHouseholdFragment";
};
export type useUserHouseholdFragment$key = {
  readonly " $data"?: useUserHouseholdFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useUserHouseholdFragment">;
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
  "name": "useUserHouseholdFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "role",
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
  "type": "UserHousehold",
  "abstractKey": null
};
})();

(node as any).hash = "5caebd33bbc5be95503f6c6445d8ffed";

export default node;
