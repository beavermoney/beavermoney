/**
 * @generated SignedSource<<0e7fa00544a96fa7ef7b2a2235e27734>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type merchantEditorUpdateMutation$variables = {
  clearIcon: boolean;
  icon?: string | null | undefined;
  id: string;
  name: string;
};
export type merchantEditorUpdateMutation$data = {
  readonly updateMerchant: {
    readonly icon: string | null | undefined;
    readonly id: string;
    readonly name: string;
  };
};
export type merchantEditorUpdateMutation = {
  response: merchantEditorUpdateMutation$data;
  variables: merchantEditorUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "clearIcon"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "icon"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "clearIcon",
        "variableName": "clearIcon"
      },
      {
        "kind": "Variable",
        "name": "icon",
        "variableName": "icon"
      },
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "Merchant",
    "kind": "LinkedField",
    "name": "updateMerchant",
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
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "merchantEditorUpdateMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "merchantEditorUpdateMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "289a0b41141395d421295180a4e84988",
    "id": null,
    "metadata": {},
    "name": "merchantEditorUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation merchantEditorUpdateMutation(\n  $id: ID!\n  $name: String!\n  $icon: String\n  $clearIcon: Boolean!\n) {\n  updateMerchant(id: $id, name: $name, icon: $icon, clearIcon: $clearIcon) {\n    id\n    name\n    icon\n  }\n}\n"
  }
};
})();

(node as any).hash = "c148f571c9fc5755008bf453a444f862";

export default node;
