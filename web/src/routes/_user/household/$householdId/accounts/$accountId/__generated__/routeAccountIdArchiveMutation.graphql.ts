/**
 * @generated SignedSource<<fbc673b828e8cba14fb7c07fc1bab4fd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type routeAccountIdArchiveMutation$variables = {
  id: string;
};
export type routeAccountIdArchiveMutation$data = {
  readonly archiveAccount: boolean;
};
export type routeAccountIdArchiveMutation = {
  response: routeAccountIdArchiveMutation$data;
  variables: routeAccountIdArchiveMutation$variables;
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
    "name": "archiveAccount",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "routeAccountIdArchiveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "routeAccountIdArchiveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4d0ac66e8ca5958955c7c95092ce07b3",
    "id": null,
    "metadata": {},
    "name": "routeAccountIdArchiveMutation",
    "operationKind": "mutation",
    "text": "mutation routeAccountIdArchiveMutation(\n  $id: ID!\n) {\n  archiveAccount(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "7369d10ba0f69246bf9c3e64408b3ec9";

export default node;
