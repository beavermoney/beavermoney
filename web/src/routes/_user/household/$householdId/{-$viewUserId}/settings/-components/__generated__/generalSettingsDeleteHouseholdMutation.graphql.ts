/**
 * @generated SignedSource<<288e765167ec2dfd559486ac8398447f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type generalSettingsDeleteHouseholdMutation$variables = {
  id: string;
};
export type generalSettingsDeleteHouseholdMutation$data = {
  readonly deleteHousehold: {
    readonly deletedHouseholdId: string;
  };
};
export type generalSettingsDeleteHouseholdMutation = {
  response: generalSettingsDeleteHouseholdMutation$data;
  variables: generalSettingsDeleteHouseholdMutation$variables;
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
    "concreteType": "DeleteHouseholdPayload",
    "kind": "LinkedField",
    "name": "deleteHousehold",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedHouseholdId",
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
    "name": "generalSettingsDeleteHouseholdMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "generalSettingsDeleteHouseholdMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2b2d57a62defa9955306b3f54362f486",
    "id": null,
    "metadata": {},
    "name": "generalSettingsDeleteHouseholdMutation",
    "operationKind": "mutation",
    "text": "mutation generalSettingsDeleteHouseholdMutation(\n  $id: ID!\n) {\n  deleteHousehold(id: $id) {\n    deletedHouseholdId\n  }\n}\n"
  }
};
})();

(node as any).hash = "debc1a5e528dc992ab5adf666c96d2e8";

export default node;
