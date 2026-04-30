/**
 * @generated SignedSource<<7a784feebcb5d2eae957524da6959815>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type membersSettingsRemoveMutation$variables = {
  id: string;
};
export type membersSettingsRemoveMutation$data = {
  readonly removeHouseholdUser: {
    readonly removedUserHouseholdId: string;
  };
};
export type membersSettingsRemoveMutation = {
  response: membersSettingsRemoveMutation$data;
  variables: membersSettingsRemoveMutation$variables;
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
    "concreteType": "RemoveHouseholdUserPayload",
    "kind": "LinkedField",
    "name": "removeHouseholdUser",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "removedUserHouseholdId",
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
    "name": "membersSettingsRemoveMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "membersSettingsRemoveMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "584dfe1c7a4a14e973bf1e867a7dc154",
    "id": null,
    "metadata": {},
    "name": "membersSettingsRemoveMutation",
    "operationKind": "mutation",
    "text": "mutation membersSettingsRemoveMutation(\n  $id: ID!\n) {\n  removeHouseholdUser(id: $id) {\n    removedUserHouseholdId\n  }\n}\n"
  }
};
})();

(node as any).hash = "68c2820805d397250954f034f8450df9";

export default node;
