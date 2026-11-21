/**
 * @generated SignedSource<<00766f3383363864eddb0983b4dc8ce4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateSnapshotInput = {
  clearNote?: boolean | null | undefined;
  note?: string | null | undefined;
};
export type reviewJournalNoteMutation$variables = {
  id: string;
  input: UpdateSnapshotInput;
};
export type reviewJournalNoteMutation$data = {
  readonly updateSnapshot: {
    readonly node: {
      readonly id: string;
      readonly note: string | null | undefined;
    } | null | undefined;
  };
};
export type reviewJournalNoteMutation = {
  response: reviewJournalNoteMutation$data;
  variables: reviewJournalNoteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
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
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "SnapshotEdge",
    "kind": "LinkedField",
    "name": "updateSnapshot",
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
            "name": "note",
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
    "name": "reviewJournalNoteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "reviewJournalNoteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4f4d87c99efc39aa12afb0efbc647969",
    "id": null,
    "metadata": {},
    "name": "reviewJournalNoteMutation",
    "operationKind": "mutation",
    "text": "mutation reviewJournalNoteMutation(\n  $id: ID!\n  $input: UpdateSnapshotInput!\n) {\n  updateSnapshot(id: $id, input: $input) {\n    node {\n      id\n      note\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3e0950fa15a0df3cc5e71038b6f02e41";

export default node;
