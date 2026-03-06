/**
 * @generated SignedSource<<27740811e10dce83f2698431ebc3c3ff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type editAccountArchiveMutation$variables = {
  id: string;
};
export type editAccountArchiveMutation$data = {
  readonly archiveAccount: boolean;
};
export type editAccountArchiveMutation = {
  response: editAccountArchiveMutation$data;
  variables: editAccountArchiveMutation$variables;
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
    "name": "editAccountArchiveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editAccountArchiveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "121099b16f18a8c7ed9610fe2a014590",
    "id": null,
    "metadata": {},
    "name": "editAccountArchiveMutation",
    "operationKind": "mutation",
    "text": "mutation editAccountArchiveMutation(\n  $id: ID!\n) {\n  archiveAccount(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "1b2ad7e37eb848de980268a448fc8b61";

export default node;
