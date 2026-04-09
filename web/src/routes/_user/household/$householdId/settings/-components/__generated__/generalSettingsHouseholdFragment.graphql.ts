/**
 * @generated SignedSource<<359da1e3eb9d49b773fdeb4766baff61>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type generalSettingsHouseholdFragment$data = {
  readonly currency: {
    readonly code: string;
    readonly id: string;
  };
  readonly id: string;
  readonly locale: string;
  readonly name: string;
  readonly " $fragmentType": "generalSettingsHouseholdFragment";
};
export type generalSettingsHouseholdFragment$key = {
  readonly " $data"?: generalSettingsHouseholdFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"generalSettingsHouseholdFragment">;
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
  "name": "generalSettingsHouseholdFragment",
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
      "concreteType": "Currency",
      "kind": "LinkedField",
      "name": "currency",
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
  "type": "Household",
  "abstractKey": null
};
})();

(node as any).hash = "fe5fd89a81b8ec83904665b9765fd326";

export default node;
