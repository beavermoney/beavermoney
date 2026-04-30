/**
 * @generated SignedSource<<aaf6680785e0a89ca53f7b09c244dcca>>
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
  readonly id: string;
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
  readonly " $fragmentSpreads": FragmentRefs<"addMemberDialogFragment">;
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
    (v0/*: any*/),
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "addMemberDialogFragment"
    }
  ],
  "type": "Household",
  "abstractKey": null
};
})();

(node as any).hash = "c118008a64e7e9e8558a4b71d4a3bd1b";

export default node;
