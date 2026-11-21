/**
 * @generated SignedSource<<529a63991a1ce2975828bb0cd21ef904>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type merchantEditorCreateMutation$variables = {
  icon?: string | null | undefined;
  name: string;
};
export type merchantEditorCreateMutation$data = {
  readonly createMerchant: {
    readonly icon: string | null | undefined;
    readonly id: string;
    readonly name: string;
  };
};
export type merchantEditorCreateMutation = {
  response: merchantEditorCreateMutation$data;
  variables: merchantEditorCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "icon"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "icon",
        "variableName": "icon"
      },
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "Merchant",
    "kind": "LinkedField",
    "name": "createMerchant",
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
        "name": "icon",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "merchantEditorCreateMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "merchantEditorCreateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "9e130cebd7df01eebe0c45e192d2ea78",
    "id": null,
    "metadata": {},
    "name": "merchantEditorCreateMutation",
    "operationKind": "mutation",
    "text": "mutation merchantEditorCreateMutation(\n  $name: String!\n  $icon: String\n) {\n  createMerchant(name: $name, icon: $icon) {\n    id\n    name\n    icon\n  }\n}\n"
  }
};
})();

(node as any).hash = "9ae24be148f796ab037a15634256b7a0";

export default node;
