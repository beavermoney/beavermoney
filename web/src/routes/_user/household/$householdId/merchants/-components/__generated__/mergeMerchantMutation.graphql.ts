/**
 * @generated SignedSource<<a4ef6a13ceaffe28f22d63e5cb73c270>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type mergeMerchantMutation$variables = {
  sourceID: string;
  targetID: string;
};
export type mergeMerchantMutation$data = {
  readonly mergeMerchant: {
    readonly deletedMerchantID: string;
    readonly reassignedCount: number;
    readonly targetMerchant: {
      readonly icon: string | null | undefined;
      readonly id: string;
      readonly name: string;
    };
  };
};
export type mergeMerchantMutation = {
  response: mergeMerchantMutation$data;
  variables: mergeMerchantMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "sourceID"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "targetID"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "sourceID",
        "variableName": "sourceID"
      },
      {
        "kind": "Variable",
        "name": "targetID",
        "variableName": "targetID"
      }
    ],
    "concreteType": "MergeMerchantPayload",
    "kind": "LinkedField",
    "name": "mergeMerchant",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedMerchantID",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "reassignedCount",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Merchant",
        "kind": "LinkedField",
        "name": "targetMerchant",
        "plural": false,
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
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "icon",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "mergeMerchantMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "mergeMerchantMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "47017423913884298c6ace213c662d01",
    "id": null,
    "metadata": {},
    "name": "mergeMerchantMutation",
    "operationKind": "mutation",
    "text": "mutation mergeMerchantMutation(\n  $sourceID: ID!\n  $targetID: ID!\n) {\n  mergeMerchant(sourceID: $sourceID, targetID: $targetID) {\n    deletedMerchantID\n    reassignedCount\n    targetMerchant {\n      id\n      name\n      icon\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8021453ef3e9a3cf72aff0d774968950";

export default node;
