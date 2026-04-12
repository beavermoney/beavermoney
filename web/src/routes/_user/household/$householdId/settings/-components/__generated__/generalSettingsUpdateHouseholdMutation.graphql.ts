/**
 * @generated SignedSource<<4fa5c57a8689a0df750cbd208719db68>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateHouseholdInput = {
  currencyCode?: string | null | undefined;
  locale?: string | null | undefined;
  name?: string | null | undefined;
};
export type generalSettingsUpdateHouseholdMutation$variables = {
  id: string;
  input: UpdateHouseholdInput;
};
export type generalSettingsUpdateHouseholdMutation$data = {
  readonly updateHousehold: {
    readonly currencyCode: string;
    readonly id: string;
    readonly locale: string;
    readonly name: string;
  };
};
export type generalSettingsUpdateHouseholdMutation = {
  response: generalSettingsUpdateHouseholdMutation$data;
  variables: generalSettingsUpdateHouseholdMutation$variables;
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
    "concreteType": "Household",
    "kind": "LinkedField",
    "name": "updateHousehold",
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "locale",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "currencyCode",
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
    "name": "generalSettingsUpdateHouseholdMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "generalSettingsUpdateHouseholdMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0e8e050f548839e0a842ea84bb479f72",
    "id": null,
    "metadata": {},
    "name": "generalSettingsUpdateHouseholdMutation",
    "operationKind": "mutation",
    "text": "mutation generalSettingsUpdateHouseholdMutation(\n  $id: ID!\n  $input: UpdateHouseholdInput!\n) {\n  updateHousehold(id: $id, input: $input) {\n    id\n    name\n    locale\n    currencyCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "f3d6754569915944b6d0c6a5279f7972";

export default node;
