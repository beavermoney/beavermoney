/**
 * @generated SignedSource<<f6b8717fb57321d526242e5f470ae99c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type UserHouseholdRole = "admin" | "member" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type membersSettingsFragment$data = {
  readonly userHouseholds: ReadonlyArray<{
    readonly householdCurrency: {
      readonly code: string;
    };
    readonly id: string;
    readonly role: UserHouseholdRole;
    readonly user: {
      readonly email: string;
      readonly id: string;
      readonly name: string;
    };
  }> | null | undefined;
  readonly " $fragmentType": "membersSettingsFragment";
};
export type membersSettingsFragment$key = {
  readonly " $data"?: membersSettingsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"membersSettingsFragment">;
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
  "name": "membersSettingsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "UserHousehold",
      "kind": "LinkedField",
      "name": "userHouseholds",
      "plural": true,
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
              "name": "email",
              "storageKey": null
            }
          ],
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

(node as any).hash = "53ff442831f91ed2b3762ed60d43fa53";

export default node;
