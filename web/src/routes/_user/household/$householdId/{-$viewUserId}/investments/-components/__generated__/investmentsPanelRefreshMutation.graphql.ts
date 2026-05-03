/**
 * @generated SignedSource<<a66746b0143c4ad33fcf4f3bb7af65bb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type investmentsPanelRefreshMutation$variables = Record<PropertyKey, never>;
export type investmentsPanelRefreshMutation$data = {
  readonly refresh: boolean;
};
export type investmentsPanelRefreshMutation = {
  response: investmentsPanelRefreshMutation$data;
  variables: investmentsPanelRefreshMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "refresh",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "investmentsPanelRefreshMutation",
    "selections": (v0/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "investmentsPanelRefreshMutation",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "5dab4780b9399e61e71b99a3e2d38a2d",
    "id": null,
    "metadata": {},
    "name": "investmentsPanelRefreshMutation",
    "operationKind": "mutation",
    "text": "mutation investmentsPanelRefreshMutation {\n  refresh\n}\n"
  }
};
})();

(node as any).hash = "dfd59d73e51b1f0f14aae9afcf251b4a";

export default node;
