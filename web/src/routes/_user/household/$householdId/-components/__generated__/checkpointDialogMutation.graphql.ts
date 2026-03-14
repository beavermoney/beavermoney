/**
 * @generated SignedSource<<00e49dc1a43db2175b0aeca82813a07a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type checkpointDialogMutation$variables = {
  note?: string | null | undefined;
};
export type checkpointDialogMutation$data = {
  readonly createCheckpoint: {
    readonly node: {
      readonly createTime: any;
      readonly id: string;
      readonly investment: string;
      readonly liability: string;
      readonly liquidity: string;
      readonly netWorth: string;
      readonly property: string;
      readonly receivable: string;
    } | null | undefined;
  };
};
export type checkpointDialogMutation = {
  response: checkpointDialogMutation$data;
  variables: checkpointDialogMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "note"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "note",
        "variableName": "note"
      }
    ],
    "concreteType": "CheckpointEdge",
    "kind": "LinkedField",
    "name": "createCheckpoint",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Checkpoint",
        "kind": "LinkedField",
        "name": "node",
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
            "name": "netWorth",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "liquidity",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "investment",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "property",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "receivable",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "liability",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createTime",
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
    "name": "checkpointDialogMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "checkpointDialogMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3a23a51bb9c9295c3f8536dbc242802e",
    "id": null,
    "metadata": {},
    "name": "checkpointDialogMutation",
    "operationKind": "mutation",
    "text": "mutation checkpointDialogMutation(\n  $note: String\n) {\n  createCheckpoint(note: $note) {\n    node {\n      id\n      netWorth\n      liquidity\n      investment\n      property\n      receivable\n      liability\n      createTime\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3408b858a6071d57ef825df71559b73e";

export default node;
