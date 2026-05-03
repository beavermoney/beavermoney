/**
 * @generated SignedSource<<94996455e420a3ffb4cba8984bdb7bbf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateSnapshotInput = {
  note?: string | null | undefined;
};
export type snapshotDialogMutation$variables = {
  input: CreateSnapshotInput;
};
export type snapshotDialogMutation$data = {
  readonly createSnapshot: {
    readonly node: {
      readonly createTime: any;
      readonly id: string;
    } | null | undefined;
  };
};
export type snapshotDialogMutation = {
  response: snapshotDialogMutation$data;
  variables: snapshotDialogMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "SnapshotEdge",
    "kind": "LinkedField",
    "name": "createSnapshot",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Snapshot",
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
    "name": "snapshotDialogMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "snapshotDialogMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "797472e88c6ea224733f862a1f883197",
    "id": null,
    "metadata": {},
    "name": "snapshotDialogMutation",
    "operationKind": "mutation",
    "text": "mutation snapshotDialogMutation(\n  $input: CreateSnapshotInput!\n) {\n  createSnapshot(input: $input) {\n    node {\n      id\n      createTime\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "696ce8d90af204bb449e717ddee88485";

export default node;
