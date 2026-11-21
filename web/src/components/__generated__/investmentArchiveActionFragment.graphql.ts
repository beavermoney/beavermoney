/**
 * @generated SignedSource<<60116331247b2b229e97bfc657bc4b74>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type investmentArchiveActionFragment$data = {
  readonly account: {
    readonly archived: boolean;
  };
  readonly amount: string;
  readonly archived: boolean;
  readonly id: string;
  readonly " $fragmentType": "investmentArchiveActionFragment";
};
export type investmentArchiveActionFragment$key = {
  readonly " $data"?: investmentArchiveActionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"investmentArchiveActionFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "archived",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "investmentArchiveActionFragment",
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
      "name": "amount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Account",
      "kind": "LinkedField",
      "name": "account",
      "plural": false,
      "selections": [
        (v0/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "Investment",
  "abstractKey": null
};
})();

(node as any).hash = "e5b32a1f802623001a05b8f11ce40ae2";

export default node;
