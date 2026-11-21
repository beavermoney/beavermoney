/**
 * @generated SignedSource<<f3b41f0cd276140e474e8b22a747f607>>
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
export type ReviewAccountVersion = {
  id: string;
  revision: string;
};
export type snapshotDialogMutation$variables = {
  expectedRevisions?: ReadonlyArray<ReviewAccountVersion> | null | undefined;
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
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "expectedRevisions"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "expectedRevisions",
        "variableName": "expectedRevisions"
      },
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "snapshotDialogMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "snapshotDialogMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "0a0ac322fcafa25a608bf5348b9aa8d5",
    "id": null,
    "metadata": {},
    "name": "snapshotDialogMutation",
    "operationKind": "mutation",
    "text": "mutation snapshotDialogMutation(\n  $input: CreateSnapshotInput!\n  $expectedRevisions: [ReviewAccountVersion!]\n) {\n  createSnapshot(input: $input, expectedRevisions: $expectedRevisions) {\n    node {\n      id\n      createTime\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a83859dccdae682b4ecdaee5e13462b8";

export default node;
