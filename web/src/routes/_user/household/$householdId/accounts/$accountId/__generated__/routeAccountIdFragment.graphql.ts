/**
 * @generated SignedSource<<7a7af7bcc569318067303d74c498247c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AccountType = "investment" | "liability" | "liquidity" | "property" | "receivable" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type routeAccountIdFragment$data = {
  readonly archived: boolean;
  readonly id: string;
  readonly type: AccountType;
  readonly " $fragmentType": "routeAccountIdFragment";
};
export type routeAccountIdFragment$key = {
  readonly " $data"?: routeAccountIdFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"routeAccountIdFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "routeAccountIdFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "archived",
      "storageKey": null
    }
  ],
  "type": "Account",
  "abstractKey": null
};

(node as any).hash = "e6d196c17915b1fa883199fe9d5e33fb";

export default node;
