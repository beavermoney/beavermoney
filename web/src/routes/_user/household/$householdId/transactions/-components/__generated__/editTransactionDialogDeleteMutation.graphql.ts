/**
 * @generated SignedSource<<d585c476f85930cbcea26e12be04c3e8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type editTransactionDialogDeleteMutation$variables = {
  id: string;
};
export type editTransactionDialogDeleteMutation$data = {
  readonly deleteTransaction: boolean;
};
export type editTransactionDialogDeleteMutation = {
  response: editTransactionDialogDeleteMutation$data;
  variables: editTransactionDialogDeleteMutation$variables;
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
    "kind": "ScalarField",
    "name": "deleteTransaction",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editTransactionDialogDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editTransactionDialogDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2e944903016d7287b0e2955a607dccc1",
    "id": null,
    "metadata": {},
    "name": "editTransactionDialogDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation editTransactionDialogDeleteMutation(\n  $id: ID!\n) {\n  deleteTransaction(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "1a663851eab3fd20944ed4dccc93992a";

export default node;
