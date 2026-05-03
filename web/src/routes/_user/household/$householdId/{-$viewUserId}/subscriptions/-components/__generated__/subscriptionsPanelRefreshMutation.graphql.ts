/**
 * @generated SignedSource<<6b898a2858d417ca97d50a26692cce98>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type subscriptionsPanelRefreshMutation$variables = Record<PropertyKey, never>;
export type subscriptionsPanelRefreshMutation$data = {
  readonly refresh: boolean;
};
export type subscriptionsPanelRefreshMutation = {
  response: subscriptionsPanelRefreshMutation$data;
  variables: subscriptionsPanelRefreshMutation$variables;
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
    "name": "subscriptionsPanelRefreshMutation",
    "selections": (v0/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "subscriptionsPanelRefreshMutation",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "567c59f64f80196073c8eafb3f351520",
    "id": null,
    "metadata": {},
    "name": "subscriptionsPanelRefreshMutation",
    "operationKind": "mutation",
    "text": "mutation subscriptionsPanelRefreshMutation {\n  refresh\n}\n"
  }
};
})();

(node as any).hash = "e485fe7645cd0bf22d7f6078978037d3";

export default node;
