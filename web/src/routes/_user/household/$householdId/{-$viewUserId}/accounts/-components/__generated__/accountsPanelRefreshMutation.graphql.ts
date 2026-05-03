/**
 * @generated SignedSource<<bfb77fce8874b00d9dfa0bd93f60569c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type accountsPanelRefreshMutation$variables = Record<PropertyKey, never>;
export type accountsPanelRefreshMutation$data = {
  readonly refresh: boolean;
};
export type accountsPanelRefreshMutation = {
  response: accountsPanelRefreshMutation$data;
  variables: accountsPanelRefreshMutation$variables;
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
    "name": "accountsPanelRefreshMutation",
    "selections": (v0/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "accountsPanelRefreshMutation",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "1116a6184fdc01e57802156d79b74b7c",
    "id": null,
    "metadata": {},
    "name": "accountsPanelRefreshMutation",
    "operationKind": "mutation",
    "text": "mutation accountsPanelRefreshMutation {\n  refresh\n}\n"
  }
};
})();

(node as any).hash = "1d1beabbb43fb3faf2c5035a3eddb2c7";

export default node;
