/**
 * @generated SignedSource<<e1351762e3cc6153ca2d43e0d19bad3c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type reviewJournalDeleteMutation$variables = {
  id: string;
};
export type reviewJournalDeleteMutation$data = {
  readonly deleteSnapshot: {
    readonly deletedSnapshotId: string;
  };
};
export type reviewJournalDeleteMutation = {
  response: reviewJournalDeleteMutation$data;
  variables: reviewJournalDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
      }
    ],
    "concreteType": "DeleteSnapshotPayload",
    "kind": "LinkedField",
    "name": "deleteSnapshot",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedSnapshotId",
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
    "name": "reviewJournalDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "reviewJournalDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b76e4b52ede63f5a97337dcdc256e463",
    "id": null,
    "metadata": {},
    "name": "reviewJournalDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation reviewJournalDeleteMutation(\n  $id: ID!\n) {\n  deleteSnapshot(id: $id) {\n    deletedSnapshotId\n  }\n}\n"
  }
};
})();

(node as any).hash = "7ebfe7a2a7c6e20cc6df69eccdfe901b";

export default node;
