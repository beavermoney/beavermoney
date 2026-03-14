/**
 * @generated SignedSource<<30e89539fc5b23351fe88e68a4d66c06>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateHouseholdInput = {
  currencyID: string;
  isDemo?: boolean | null | undefined;
  locale: string;
  name: string;
};
export type newHouseholdMutation$variables = {
  input: CreateHouseholdInput;
};
export type newHouseholdMutation$data = {
  readonly createHousehold: {
    readonly id: string;
    readonly name: string;
  };
};
export type newHouseholdMutation = {
  response: newHouseholdMutation$data;
  variables: newHouseholdMutation$variables;
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
    "concreteType": "Household",
    "kind": "LinkedField",
    "name": "createHousehold",
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
        "name": "name",
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
    "name": "newHouseholdMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "newHouseholdMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "24e9cf3abd8b2c162e827208083f8382",
    "id": null,
    "metadata": {},
    "name": "newHouseholdMutation",
    "operationKind": "mutation",
    "text": "mutation newHouseholdMutation(\n  $input: CreateHouseholdInput!\n) {\n  createHousehold(input: $input) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "fd79d164d5bd6d4ea5c5475280ba026a";

export default node;
