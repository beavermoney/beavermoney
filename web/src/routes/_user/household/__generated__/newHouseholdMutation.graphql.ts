/**
 * @generated SignedSource<<3ddcd2f76aa5458bbb14f08eae8b0db9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateHouseholdInputCustom = {
  currencyCode: string;
  input: CreateHouseholdInput;
};
export type CreateHouseholdInput = {
  isDemo?: boolean | null | undefined;
  locale: string;
  name: string;
};
export type newHouseholdMutation$variables = {
  input: CreateHouseholdInputCustom;
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
    "cacheID": "a9707cf5ce073e6df7372c94d523d6c9",
    "id": null,
    "metadata": {},
    "name": "newHouseholdMutation",
    "operationKind": "mutation",
    "text": "mutation newHouseholdMutation(\n  $input: CreateHouseholdInputCustom!\n) {\n  createHousehold(input: $input) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "5a6be08e1953ca2c679f68ee4b30bc26";

export default node;
