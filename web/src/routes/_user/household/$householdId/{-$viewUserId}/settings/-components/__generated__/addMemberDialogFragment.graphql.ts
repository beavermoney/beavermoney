/**
 * @generated SignedSource<<c2218165d077be1f5688006c4eface15>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type addMemberDialogFragment$data = {
  readonly householdCurrencies: ReadonlyArray<{
    readonly code: string;
    readonly id: string;
  }> | null | undefined;
  readonly id: string;
  readonly userHouseholds: ReadonlyArray<{
    readonly id: string;
    readonly user: {
      readonly id: string;
    };
  }> | null | undefined;
  readonly " $fragmentType": "addMemberDialogFragment";
};
export type addMemberDialogFragment$key = {
  readonly " $data"?: addMemberDialogFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"addMemberDialogFragment">;
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
  "name": "addMemberDialogFragment",
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
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "user",
          "plural": false,
          "selections": [
            (v0/*: any*/)
          ],
          "storageKey": null
        }
      ],
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

(node as any).hash = "b7977129d72842780337d50e7db83aaf";

export default node;
