/**
 * @generated SignedSource<<8975906477126be36d260ca4dd891c9c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AccountType = "investment" | "liability" | "liquidity" | "property" | "receivable" | "%future added value";
export type InvestmentType = "crypto" | "stock" | "%future added value";
export type RecurringSubscriptionInterval = "month" | "week" | "year" | "%future added value";
export type TransactionCategoryType = "expense" | "income" | "investment" | "setup" | "transfer" | "%future added value";
export type UserHouseholdRole = "admin" | "member" | "%future added value";
export type UserKeyProvider = "google" | "%future added value";
export type TransactionWhereInput = {
  and?: ReadonlyArray<TransactionWhereInput> | null | undefined;
  categoryID?: string | null | undefined;
  categoryIDIn?: ReadonlyArray<string> | null | undefined;
  categoryIDNEQ?: string | null | undefined;
  categoryIDNotIn?: ReadonlyArray<string> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  datetime?: any | null | undefined;
  datetimeGT?: any | null | undefined;
  datetimeGTE?: any | null | undefined;
  datetimeIn?: ReadonlyArray<any> | null | undefined;
  datetimeLT?: any | null | undefined;
  datetimeLTE?: any | null | undefined;
  datetimeNEQ?: any | null | undefined;
  datetimeNotIn?: ReadonlyArray<any> | null | undefined;
  description?: string | null | undefined;
  descriptionContains?: string | null | undefined;
  descriptionContainsFold?: string | null | undefined;
  descriptionEqualFold?: string | null | undefined;
  descriptionGT?: string | null | undefined;
  descriptionGTE?: string | null | undefined;
  descriptionHasPrefix?: string | null | undefined;
  descriptionHasSuffix?: string | null | undefined;
  descriptionIn?: ReadonlyArray<string> | null | undefined;
  descriptionIsNil?: boolean | null | undefined;
  descriptionLT?: string | null | undefined;
  descriptionLTE?: string | null | undefined;
  descriptionNEQ?: string | null | undefined;
  descriptionNotIn?: ReadonlyArray<string> | null | undefined;
  descriptionNotNil?: boolean | null | undefined;
  hasCategory?: boolean | null | undefined;
  hasCategoryWith?: ReadonlyArray<TransactionCategoryWhereInput> | null | undefined;
  hasHousehold?: boolean | null | undefined;
  hasHouseholdWith?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  hasInvestmentLots?: boolean | null | undefined;
  hasInvestmentLotsWith?: ReadonlyArray<InvestmentLotWhereInput> | null | undefined;
  hasTransactionEntries?: boolean | null | undefined;
  hasTransactionEntriesWith?: ReadonlyArray<TransactionEntryWhereInput> | null | undefined;
  hasUser?: boolean | null | undefined;
  hasUserWith?: ReadonlyArray<UserWhereInput> | null | undefined;
  householdID?: string | null | undefined;
  householdIDIn?: ReadonlyArray<string> | null | undefined;
  householdIDNEQ?: string | null | undefined;
  householdIDNotIn?: ReadonlyArray<string> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  not?: TransactionWhereInput | null | undefined;
  or?: ReadonlyArray<TransactionWhereInput> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
  userID?: string | null | undefined;
  userIDIn?: ReadonlyArray<string> | null | undefined;
  userIDNEQ?: string | null | undefined;
  userIDNotIn?: ReadonlyArray<string> | null | undefined;
};
export type UserWhereInput = {
  and?: ReadonlyArray<UserWhereInput> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  email?: string | null | undefined;
  emailContains?: string | null | undefined;
  emailContainsFold?: string | null | undefined;
  emailEqualFold?: string | null | undefined;
  emailGT?: string | null | undefined;
  emailGTE?: string | null | undefined;
  emailHasPrefix?: string | null | undefined;
  emailHasSuffix?: string | null | undefined;
  emailIn?: ReadonlyArray<string> | null | undefined;
  emailLT?: string | null | undefined;
  emailLTE?: string | null | undefined;
  emailNEQ?: string | null | undefined;
  emailNotIn?: ReadonlyArray<string> | null | undefined;
  hasAccounts?: boolean | null | undefined;
  hasAccountsWith?: ReadonlyArray<AccountWhereInput> | null | undefined;
  hasHouseholds?: boolean | null | undefined;
  hasHouseholdsWith?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  hasRecurringSubscriptions?: boolean | null | undefined;
  hasRecurringSubscriptionsWith?: ReadonlyArray<RecurringSubscriptionWhereInput> | null | undefined;
  hasTransactions?: boolean | null | undefined;
  hasTransactionsWith?: ReadonlyArray<TransactionWhereInput> | null | undefined;
  hasUserHouseholds?: boolean | null | undefined;
  hasUserHouseholdsWith?: ReadonlyArray<UserHouseholdWhereInput> | null | undefined;
  hasUserKeys?: boolean | null | undefined;
  hasUserKeysWith?: ReadonlyArray<UserKeyWhereInput> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  name?: string | null | undefined;
  nameContains?: string | null | undefined;
  nameContainsFold?: string | null | undefined;
  nameEqualFold?: string | null | undefined;
  nameGT?: string | null | undefined;
  nameGTE?: string | null | undefined;
  nameHasPrefix?: string | null | undefined;
  nameHasSuffix?: string | null | undefined;
  nameIn?: ReadonlyArray<string> | null | undefined;
  nameLT?: string | null | undefined;
  nameLTE?: string | null | undefined;
  nameNEQ?: string | null | undefined;
  nameNotIn?: ReadonlyArray<string> | null | undefined;
  not?: UserWhereInput | null | undefined;
  or?: ReadonlyArray<UserWhereInput> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
};
export type HouseholdWhereInput = {
  and?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  currencyID?: string | null | undefined;
  currencyIDIn?: ReadonlyArray<string> | null | undefined;
  currencyIDNEQ?: string | null | undefined;
  currencyIDNotIn?: ReadonlyArray<string> | null | undefined;
  hasAccounts?: boolean | null | undefined;
  hasAccountsWith?: ReadonlyArray<AccountWhereInput> | null | undefined;
  hasCurrency?: boolean | null | undefined;
  hasCurrencyWith?: ReadonlyArray<CurrencyWhereInput> | null | undefined;
  hasInvestmentLots?: boolean | null | undefined;
  hasInvestmentLotsWith?: ReadonlyArray<InvestmentLotWhereInput> | null | undefined;
  hasInvestments?: boolean | null | undefined;
  hasInvestmentsWith?: ReadonlyArray<InvestmentWhereInput> | null | undefined;
  hasRecurringSubscriptions?: boolean | null | undefined;
  hasRecurringSubscriptionsWith?: ReadonlyArray<RecurringSubscriptionWhereInput> | null | undefined;
  hasTransactionCategories?: boolean | null | undefined;
  hasTransactionCategoriesWith?: ReadonlyArray<TransactionCategoryWhereInput> | null | undefined;
  hasTransactionEntries?: boolean | null | undefined;
  hasTransactionEntriesWith?: ReadonlyArray<TransactionEntryWhereInput> | null | undefined;
  hasTransactions?: boolean | null | undefined;
  hasTransactionsWith?: ReadonlyArray<TransactionWhereInput> | null | undefined;
  hasUserHouseholds?: boolean | null | undefined;
  hasUserHouseholdsWith?: ReadonlyArray<UserHouseholdWhereInput> | null | undefined;
  hasUsers?: boolean | null | undefined;
  hasUsersWith?: ReadonlyArray<UserWhereInput> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  locale?: string | null | undefined;
  localeContains?: string | null | undefined;
  localeContainsFold?: string | null | undefined;
  localeEqualFold?: string | null | undefined;
  localeGT?: string | null | undefined;
  localeGTE?: string | null | undefined;
  localeHasPrefix?: string | null | undefined;
  localeHasSuffix?: string | null | undefined;
  localeIn?: ReadonlyArray<string> | null | undefined;
  localeLT?: string | null | undefined;
  localeLTE?: string | null | undefined;
  localeNEQ?: string | null | undefined;
  localeNotIn?: ReadonlyArray<string> | null | undefined;
  name?: string | null | undefined;
  nameContains?: string | null | undefined;
  nameContainsFold?: string | null | undefined;
  nameEqualFold?: string | null | undefined;
  nameGT?: string | null | undefined;
  nameGTE?: string | null | undefined;
  nameHasPrefix?: string | null | undefined;
  nameHasSuffix?: string | null | undefined;
  nameIn?: ReadonlyArray<string> | null | undefined;
  nameLT?: string | null | undefined;
  nameLTE?: string | null | undefined;
  nameNEQ?: string | null | undefined;
  nameNotIn?: ReadonlyArray<string> | null | undefined;
  not?: HouseholdWhereInput | null | undefined;
  or?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
};
export type CurrencyWhereInput = {
  and?: ReadonlyArray<CurrencyWhereInput> | null | undefined;
  code?: string | null | undefined;
  codeContains?: string | null | undefined;
  codeContainsFold?: string | null | undefined;
  codeEqualFold?: string | null | undefined;
  codeGT?: string | null | undefined;
  codeGTE?: string | null | undefined;
  codeHasPrefix?: string | null | undefined;
  codeHasSuffix?: string | null | undefined;
  codeIn?: ReadonlyArray<string> | null | undefined;
  codeLT?: string | null | undefined;
  codeLTE?: string | null | undefined;
  codeNEQ?: string | null | undefined;
  codeNotIn?: ReadonlyArray<string> | null | undefined;
  hasAccounts?: boolean | null | undefined;
  hasAccountsWith?: ReadonlyArray<AccountWhereInput> | null | undefined;
  hasHouseholds?: boolean | null | undefined;
  hasHouseholdsWith?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  hasInvestments?: boolean | null | undefined;
  hasInvestmentsWith?: ReadonlyArray<InvestmentWhereInput> | null | undefined;
  hasRecurringSubscriptions?: boolean | null | undefined;
  hasRecurringSubscriptionsWith?: ReadonlyArray<RecurringSubscriptionWhereInput> | null | undefined;
  hasTransactionEntries?: boolean | null | undefined;
  hasTransactionEntriesWith?: ReadonlyArray<TransactionEntryWhereInput> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  not?: CurrencyWhereInput | null | undefined;
  or?: ReadonlyArray<CurrencyWhereInput> | null | undefined;
};
export type AccountWhereInput = {
  and?: ReadonlyArray<AccountWhereInput> | null | undefined;
  balance?: string | null | undefined;
  balanceGT?: string | null | undefined;
  balanceGTE?: string | null | undefined;
  balanceIn?: ReadonlyArray<string> | null | undefined;
  balanceLT?: string | null | undefined;
  balanceLTE?: string | null | undefined;
  balanceNEQ?: string | null | undefined;
  balanceNotIn?: ReadonlyArray<string> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  currencyID?: string | null | undefined;
  currencyIDIn?: ReadonlyArray<string> | null | undefined;
  currencyIDNEQ?: string | null | undefined;
  currencyIDNotIn?: ReadonlyArray<string> | null | undefined;
  fxRate?: string | null | undefined;
  fxRateGT?: string | null | undefined;
  fxRateGTE?: string | null | undefined;
  fxRateIn?: ReadonlyArray<string> | null | undefined;
  fxRateLT?: string | null | undefined;
  fxRateLTE?: string | null | undefined;
  fxRateNEQ?: string | null | undefined;
  fxRateNotIn?: ReadonlyArray<string> | null | undefined;
  hasCurrency?: boolean | null | undefined;
  hasCurrencyWith?: ReadonlyArray<CurrencyWhereInput> | null | undefined;
  hasHousehold?: boolean | null | undefined;
  hasHouseholdWith?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  hasInvestments?: boolean | null | undefined;
  hasInvestmentsWith?: ReadonlyArray<InvestmentWhereInput> | null | undefined;
  hasTransactionEntries?: boolean | null | undefined;
  hasTransactionEntriesWith?: ReadonlyArray<TransactionEntryWhereInput> | null | undefined;
  hasUser?: boolean | null | undefined;
  hasUserWith?: ReadonlyArray<UserWhereInput> | null | undefined;
  householdID?: string | null | undefined;
  householdIDIn?: ReadonlyArray<string> | null | undefined;
  householdIDNEQ?: string | null | undefined;
  householdIDNotIn?: ReadonlyArray<string> | null | undefined;
  icon?: string | null | undefined;
  iconContains?: string | null | undefined;
  iconContainsFold?: string | null | undefined;
  iconEqualFold?: string | null | undefined;
  iconGT?: string | null | undefined;
  iconGTE?: string | null | undefined;
  iconHasPrefix?: string | null | undefined;
  iconHasSuffix?: string | null | undefined;
  iconIn?: ReadonlyArray<string> | null | undefined;
  iconIsNil?: boolean | null | undefined;
  iconLT?: string | null | undefined;
  iconLTE?: string | null | undefined;
  iconNEQ?: string | null | undefined;
  iconNotIn?: ReadonlyArray<string> | null | undefined;
  iconNotNil?: boolean | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  name?: string | null | undefined;
  nameContains?: string | null | undefined;
  nameContainsFold?: string | null | undefined;
  nameEqualFold?: string | null | undefined;
  nameGT?: string | null | undefined;
  nameGTE?: string | null | undefined;
  nameHasPrefix?: string | null | undefined;
  nameHasSuffix?: string | null | undefined;
  nameIn?: ReadonlyArray<string> | null | undefined;
  nameLT?: string | null | undefined;
  nameLTE?: string | null | undefined;
  nameNEQ?: string | null | undefined;
  nameNotIn?: ReadonlyArray<string> | null | undefined;
  not?: AccountWhereInput | null | undefined;
  or?: ReadonlyArray<AccountWhereInput> | null | undefined;
  type?: AccountType | null | undefined;
  typeIn?: ReadonlyArray<AccountType> | null | undefined;
  typeNEQ?: AccountType | null | undefined;
  typeNotIn?: ReadonlyArray<AccountType> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
  userID?: string | null | undefined;
  userIDIn?: ReadonlyArray<string> | null | undefined;
  userIDNEQ?: string | null | undefined;
  userIDNotIn?: ReadonlyArray<string> | null | undefined;
  value?: string | null | undefined;
  valueGT?: string | null | undefined;
  valueGTE?: string | null | undefined;
  valueIn?: ReadonlyArray<string> | null | undefined;
  valueLT?: string | null | undefined;
  valueLTE?: string | null | undefined;
  valueNEQ?: string | null | undefined;
  valueNotIn?: ReadonlyArray<string> | null | undefined;
};
export type TransactionEntryWhereInput = {
  accountID?: string | null | undefined;
  accountIDIn?: ReadonlyArray<string> | null | undefined;
  accountIDNEQ?: string | null | undefined;
  accountIDNotIn?: ReadonlyArray<string> | null | undefined;
  amount?: string | null | undefined;
  amountGT?: string | null | undefined;
  amountGTE?: string | null | undefined;
  amountIn?: ReadonlyArray<string> | null | undefined;
  amountLT?: string | null | undefined;
  amountLTE?: string | null | undefined;
  amountNEQ?: string | null | undefined;
  amountNotIn?: ReadonlyArray<string> | null | undefined;
  and?: ReadonlyArray<TransactionEntryWhereInput> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  currencyID?: string | null | undefined;
  currencyIDIn?: ReadonlyArray<string> | null | undefined;
  currencyIDNEQ?: string | null | undefined;
  currencyIDNotIn?: ReadonlyArray<string> | null | undefined;
  hasAccount?: boolean | null | undefined;
  hasAccountWith?: ReadonlyArray<AccountWhereInput> | null | undefined;
  hasCurrency?: boolean | null | undefined;
  hasCurrencyWith?: ReadonlyArray<CurrencyWhereInput> | null | undefined;
  hasHousehold?: boolean | null | undefined;
  hasHouseholdWith?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  hasTransaction?: boolean | null | undefined;
  hasTransactionWith?: ReadonlyArray<TransactionWhereInput> | null | undefined;
  householdID?: string | null | undefined;
  householdIDIn?: ReadonlyArray<string> | null | undefined;
  householdIDNEQ?: string | null | undefined;
  householdIDNotIn?: ReadonlyArray<string> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  not?: TransactionEntryWhereInput | null | undefined;
  or?: ReadonlyArray<TransactionEntryWhereInput> | null | undefined;
  transactionID?: string | null | undefined;
  transactionIDIn?: ReadonlyArray<string> | null | undefined;
  transactionIDNEQ?: string | null | undefined;
  transactionIDNotIn?: ReadonlyArray<string> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
};
export type InvestmentWhereInput = {
  accountID?: string | null | undefined;
  accountIDIn?: ReadonlyArray<string> | null | undefined;
  accountIDNEQ?: string | null | undefined;
  accountIDNotIn?: ReadonlyArray<string> | null | undefined;
  amount?: string | null | undefined;
  amountGT?: string | null | undefined;
  amountGTE?: string | null | undefined;
  amountIn?: ReadonlyArray<string> | null | undefined;
  amountLT?: string | null | undefined;
  amountLTE?: string | null | undefined;
  amountNEQ?: string | null | undefined;
  amountNotIn?: ReadonlyArray<string> | null | undefined;
  and?: ReadonlyArray<InvestmentWhereInput> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  currencyID?: string | null | undefined;
  currencyIDIn?: ReadonlyArray<string> | null | undefined;
  currencyIDNEQ?: string | null | undefined;
  currencyIDNotIn?: ReadonlyArray<string> | null | undefined;
  hasAccount?: boolean | null | undefined;
  hasAccountWith?: ReadonlyArray<AccountWhereInput> | null | undefined;
  hasCurrency?: boolean | null | undefined;
  hasCurrencyWith?: ReadonlyArray<CurrencyWhereInput> | null | undefined;
  hasHousehold?: boolean | null | undefined;
  hasHouseholdWith?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  hasInvestmentLots?: boolean | null | undefined;
  hasInvestmentLotsWith?: ReadonlyArray<InvestmentLotWhereInput> | null | undefined;
  householdID?: string | null | undefined;
  householdIDIn?: ReadonlyArray<string> | null | undefined;
  householdIDNEQ?: string | null | undefined;
  householdIDNotIn?: ReadonlyArray<string> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  name?: string | null | undefined;
  nameContains?: string | null | undefined;
  nameContainsFold?: string | null | undefined;
  nameEqualFold?: string | null | undefined;
  nameGT?: string | null | undefined;
  nameGTE?: string | null | undefined;
  nameHasPrefix?: string | null | undefined;
  nameHasSuffix?: string | null | undefined;
  nameIn?: ReadonlyArray<string> | null | undefined;
  nameLT?: string | null | undefined;
  nameLTE?: string | null | undefined;
  nameNEQ?: string | null | undefined;
  nameNotIn?: ReadonlyArray<string> | null | undefined;
  not?: InvestmentWhereInput | null | undefined;
  or?: ReadonlyArray<InvestmentWhereInput> | null | undefined;
  quote?: string | null | undefined;
  quoteGT?: string | null | undefined;
  quoteGTE?: string | null | undefined;
  quoteIn?: ReadonlyArray<string> | null | undefined;
  quoteLT?: string | null | undefined;
  quoteLTE?: string | null | undefined;
  quoteNEQ?: string | null | undefined;
  quoteNotIn?: ReadonlyArray<string> | null | undefined;
  symbol?: string | null | undefined;
  symbolContains?: string | null | undefined;
  symbolContainsFold?: string | null | undefined;
  symbolEqualFold?: string | null | undefined;
  symbolGT?: string | null | undefined;
  symbolGTE?: string | null | undefined;
  symbolHasPrefix?: string | null | undefined;
  symbolHasSuffix?: string | null | undefined;
  symbolIn?: ReadonlyArray<string> | null | undefined;
  symbolLT?: string | null | undefined;
  symbolLTE?: string | null | undefined;
  symbolNEQ?: string | null | undefined;
  symbolNotIn?: ReadonlyArray<string> | null | undefined;
  type?: InvestmentType | null | undefined;
  typeIn?: ReadonlyArray<InvestmentType> | null | undefined;
  typeNEQ?: InvestmentType | null | undefined;
  typeNotIn?: ReadonlyArray<InvestmentType> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
  value?: string | null | undefined;
  valueGT?: string | null | undefined;
  valueGTE?: string | null | undefined;
  valueIn?: ReadonlyArray<string> | null | undefined;
  valueLT?: string | null | undefined;
  valueLTE?: string | null | undefined;
  valueNEQ?: string | null | undefined;
  valueNotIn?: ReadonlyArray<string> | null | undefined;
};
export type InvestmentLotWhereInput = {
  amount?: string | null | undefined;
  amountGT?: string | null | undefined;
  amountGTE?: string | null | undefined;
  amountIn?: ReadonlyArray<string> | null | undefined;
  amountLT?: string | null | undefined;
  amountLTE?: string | null | undefined;
  amountNEQ?: string | null | undefined;
  amountNotIn?: ReadonlyArray<string> | null | undefined;
  and?: ReadonlyArray<InvestmentLotWhereInput> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  hasHousehold?: boolean | null | undefined;
  hasHouseholdWith?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  hasInvestment?: boolean | null | undefined;
  hasInvestmentWith?: ReadonlyArray<InvestmentWhereInput> | null | undefined;
  hasTransaction?: boolean | null | undefined;
  hasTransactionWith?: ReadonlyArray<TransactionWhereInput> | null | undefined;
  householdID?: string | null | undefined;
  householdIDIn?: ReadonlyArray<string> | null | undefined;
  householdIDNEQ?: string | null | undefined;
  householdIDNotIn?: ReadonlyArray<string> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  investmentID?: string | null | undefined;
  investmentIDIn?: ReadonlyArray<string> | null | undefined;
  investmentIDNEQ?: string | null | undefined;
  investmentIDNotIn?: ReadonlyArray<string> | null | undefined;
  not?: InvestmentLotWhereInput | null | undefined;
  or?: ReadonlyArray<InvestmentLotWhereInput> | null | undefined;
  price?: string | null | undefined;
  priceGT?: string | null | undefined;
  priceGTE?: string | null | undefined;
  priceIn?: ReadonlyArray<string> | null | undefined;
  priceLT?: string | null | undefined;
  priceLTE?: string | null | undefined;
  priceNEQ?: string | null | undefined;
  priceNotIn?: ReadonlyArray<string> | null | undefined;
  transactionID?: string | null | undefined;
  transactionIDIn?: ReadonlyArray<string> | null | undefined;
  transactionIDNEQ?: string | null | undefined;
  transactionIDNotIn?: ReadonlyArray<string> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
};
export type RecurringSubscriptionWhereInput = {
  active?: boolean | null | undefined;
  activeNEQ?: boolean | null | undefined;
  and?: ReadonlyArray<RecurringSubscriptionWhereInput> | null | undefined;
  cost?: string | null | undefined;
  costGT?: string | null | undefined;
  costGTE?: string | null | undefined;
  costIn?: ReadonlyArray<string> | null | undefined;
  costLT?: string | null | undefined;
  costLTE?: string | null | undefined;
  costNEQ?: string | null | undefined;
  costNotIn?: ReadonlyArray<string> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  currencyID?: string | null | undefined;
  currencyIDIn?: ReadonlyArray<string> | null | undefined;
  currencyIDNEQ?: string | null | undefined;
  currencyIDNotIn?: ReadonlyArray<string> | null | undefined;
  fxRate?: string | null | undefined;
  fxRateGT?: string | null | undefined;
  fxRateGTE?: string | null | undefined;
  fxRateIn?: ReadonlyArray<string> | null | undefined;
  fxRateLT?: string | null | undefined;
  fxRateLTE?: string | null | undefined;
  fxRateNEQ?: string | null | undefined;
  fxRateNotIn?: ReadonlyArray<string> | null | undefined;
  hasCurrency?: boolean | null | undefined;
  hasCurrencyWith?: ReadonlyArray<CurrencyWhereInput> | null | undefined;
  hasHousehold?: boolean | null | undefined;
  hasHouseholdWith?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  hasUser?: boolean | null | undefined;
  hasUserWith?: ReadonlyArray<UserWhereInput> | null | undefined;
  householdID?: string | null | undefined;
  householdIDIn?: ReadonlyArray<string> | null | undefined;
  householdIDNEQ?: string | null | undefined;
  householdIDNotIn?: ReadonlyArray<string> | null | undefined;
  icon?: string | null | undefined;
  iconContains?: string | null | undefined;
  iconContainsFold?: string | null | undefined;
  iconEqualFold?: string | null | undefined;
  iconGT?: string | null | undefined;
  iconGTE?: string | null | undefined;
  iconHasPrefix?: string | null | undefined;
  iconHasSuffix?: string | null | undefined;
  iconIn?: ReadonlyArray<string> | null | undefined;
  iconIsNil?: boolean | null | undefined;
  iconLT?: string | null | undefined;
  iconLTE?: string | null | undefined;
  iconNEQ?: string | null | undefined;
  iconNotIn?: ReadonlyArray<string> | null | undefined;
  iconNotNil?: boolean | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  interval?: RecurringSubscriptionInterval | null | undefined;
  intervalCount?: number | null | undefined;
  intervalCountGT?: number | null | undefined;
  intervalCountGTE?: number | null | undefined;
  intervalCountIn?: ReadonlyArray<number> | null | undefined;
  intervalCountLT?: number | null | undefined;
  intervalCountLTE?: number | null | undefined;
  intervalCountNEQ?: number | null | undefined;
  intervalCountNotIn?: ReadonlyArray<number> | null | undefined;
  intervalIn?: ReadonlyArray<RecurringSubscriptionInterval> | null | undefined;
  intervalNEQ?: RecurringSubscriptionInterval | null | undefined;
  intervalNotIn?: ReadonlyArray<RecurringSubscriptionInterval> | null | undefined;
  name?: string | null | undefined;
  nameContains?: string | null | undefined;
  nameContainsFold?: string | null | undefined;
  nameEqualFold?: string | null | undefined;
  nameGT?: string | null | undefined;
  nameGTE?: string | null | undefined;
  nameHasPrefix?: string | null | undefined;
  nameHasSuffix?: string | null | undefined;
  nameIn?: ReadonlyArray<string> | null | undefined;
  nameLT?: string | null | undefined;
  nameLTE?: string | null | undefined;
  nameNEQ?: string | null | undefined;
  nameNotIn?: ReadonlyArray<string> | null | undefined;
  not?: RecurringSubscriptionWhereInput | null | undefined;
  or?: ReadonlyArray<RecurringSubscriptionWhereInput> | null | undefined;
  startDate?: any | null | undefined;
  startDateGT?: any | null | undefined;
  startDateGTE?: any | null | undefined;
  startDateIn?: ReadonlyArray<any> | null | undefined;
  startDateLT?: any | null | undefined;
  startDateLTE?: any | null | undefined;
  startDateNEQ?: any | null | undefined;
  startDateNotIn?: ReadonlyArray<any> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
  userID?: string | null | undefined;
  userIDIn?: ReadonlyArray<string> | null | undefined;
  userIDNEQ?: string | null | undefined;
  userIDNotIn?: ReadonlyArray<string> | null | undefined;
};
export type TransactionCategoryWhereInput = {
  and?: ReadonlyArray<TransactionCategoryWhereInput> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  hasHousehold?: boolean | null | undefined;
  hasHouseholdWith?: ReadonlyArray<HouseholdWhereInput> | null | undefined;
  hasTransactions?: boolean | null | undefined;
  hasTransactionsWith?: ReadonlyArray<TransactionWhereInput> | null | undefined;
  householdID?: string | null | undefined;
  householdIDIn?: ReadonlyArray<string> | null | undefined;
  householdIDNEQ?: string | null | undefined;
  householdIDNotIn?: ReadonlyArray<string> | null | undefined;
  icon?: string | null | undefined;
  iconContains?: string | null | undefined;
  iconContainsFold?: string | null | undefined;
  iconEqualFold?: string | null | undefined;
  iconGT?: string | null | undefined;
  iconGTE?: string | null | undefined;
  iconHasPrefix?: string | null | undefined;
  iconHasSuffix?: string | null | undefined;
  iconIn?: ReadonlyArray<string> | null | undefined;
  iconLT?: string | null | undefined;
  iconLTE?: string | null | undefined;
  iconNEQ?: string | null | undefined;
  iconNotIn?: ReadonlyArray<string> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  isImmutable?: boolean | null | undefined;
  isImmutableNEQ?: boolean | null | undefined;
  name?: string | null | undefined;
  nameContains?: string | null | undefined;
  nameContainsFold?: string | null | undefined;
  nameEqualFold?: string | null | undefined;
  nameGT?: string | null | undefined;
  nameGTE?: string | null | undefined;
  nameHasPrefix?: string | null | undefined;
  nameHasSuffix?: string | null | undefined;
  nameIn?: ReadonlyArray<string> | null | undefined;
  nameLT?: string | null | undefined;
  nameLTE?: string | null | undefined;
  nameNEQ?: string | null | undefined;
  nameNotIn?: ReadonlyArray<string> | null | undefined;
  not?: TransactionCategoryWhereInput | null | undefined;
  or?: ReadonlyArray<TransactionCategoryWhereInput> | null | undefined;
  type?: TransactionCategoryType | null | undefined;
  typeIn?: ReadonlyArray<TransactionCategoryType> | null | undefined;
  typeNEQ?: TransactionCategoryType | null | undefined;
  typeNotIn?: ReadonlyArray<TransactionCategoryType> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
};
export type UserHouseholdWhereInput = {
  and?: ReadonlyArray<UserHouseholdWhereInput> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  not?: UserHouseholdWhereInput | null | undefined;
  or?: ReadonlyArray<UserHouseholdWhereInput> | null | undefined;
  role?: UserHouseholdRole | null | undefined;
  roleIn?: ReadonlyArray<UserHouseholdRole> | null | undefined;
  roleNEQ?: UserHouseholdRole | null | undefined;
  roleNotIn?: ReadonlyArray<UserHouseholdRole> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
};
export type UserKeyWhereInput = {
  and?: ReadonlyArray<UserKeyWhereInput> | null | undefined;
  createTime?: any | null | undefined;
  createTimeGT?: any | null | undefined;
  createTimeGTE?: any | null | undefined;
  createTimeIn?: ReadonlyArray<any> | null | undefined;
  createTimeLT?: any | null | undefined;
  createTimeLTE?: any | null | undefined;
  createTimeNEQ?: any | null | undefined;
  createTimeNotIn?: ReadonlyArray<any> | null | undefined;
  hasUser?: boolean | null | undefined;
  hasUserWith?: ReadonlyArray<UserWhereInput> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  key?: string | null | undefined;
  keyContains?: string | null | undefined;
  keyContainsFold?: string | null | undefined;
  keyEqualFold?: string | null | undefined;
  keyGT?: string | null | undefined;
  keyGTE?: string | null | undefined;
  keyHasPrefix?: string | null | undefined;
  keyHasSuffix?: string | null | undefined;
  keyIn?: ReadonlyArray<string> | null | undefined;
  keyLT?: string | null | undefined;
  keyLTE?: string | null | undefined;
  keyNEQ?: string | null | undefined;
  keyNotIn?: ReadonlyArray<string> | null | undefined;
  not?: UserKeyWhereInput | null | undefined;
  or?: ReadonlyArray<UserKeyWhereInput> | null | undefined;
  provider?: UserKeyProvider | null | undefined;
  providerIn?: ReadonlyArray<UserKeyProvider> | null | undefined;
  providerNEQ?: UserKeyProvider | null | undefined;
  providerNotIn?: ReadonlyArray<UserKeyProvider> | null | undefined;
  updateTime?: any | null | undefined;
  updateTimeGT?: any | null | undefined;
  updateTimeGTE?: any | null | undefined;
  updateTimeIn?: ReadonlyArray<any> | null | undefined;
  updateTimeLT?: any | null | undefined;
  updateTimeLTE?: any | null | undefined;
  updateTimeNEQ?: any | null | undefined;
  updateTimeNotIn?: ReadonlyArray<any> | null | undefined;
  userID?: string | null | undefined;
  userIDIn?: ReadonlyArray<string> | null | undefined;
  userIDNEQ?: string | null | undefined;
  userIDNotIn?: ReadonlyArray<string> | null | undefined;
};
export type InvestmentIdQuery$variables = {
  where?: TransactionWhereInput | null | undefined;
};
export type InvestmentIdQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"transactionsListFragment">;
};
export type InvestmentIdQuery = {
  response: InvestmentIdQuery$data;
  variables: InvestmentIdQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "where"
  }
],
v1 = {
  "kind": "Variable",
  "name": "where",
  "variableName": "where"
},
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": {
      "direction": "DESC",
      "field": "DATETIME"
    }
  },
  (v1/*: any*/)
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "amount",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "Currency",
  "kind": "LinkedField",
  "name": "currency",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "code",
      "storageKey": null
    },
    (v3/*: any*/)
  ],
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "datetime",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InvestmentIdQuery",
    "selections": [
      {
        "args": [
          (v1/*: any*/)
        ],
        "kind": "FragmentSpread",
        "name": "transactionsListFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InvestmentIdQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "TransactionConnection",
        "kind": "LinkedField",
        "name": "transactions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "TransactionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Transaction",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "TransactionEntry",
                    "kind": "LinkedField",
                    "name": "transactionEntries",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      (v4/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Account",
                        "kind": "LinkedField",
                        "name": "account",
                        "plural": false,
                        "selections": [
                          (v5/*: any*/),
                          (v6/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Transaction",
                        "kind": "LinkedField",
                        "name": "transaction",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "TransactionCategory",
                            "kind": "LinkedField",
                            "name": "category",
                            "plural": false,
                            "selections": [
                              (v5/*: any*/),
                              (v7/*: any*/),
                              (v8/*: any*/),
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v9/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "InvestmentLot",
                    "kind": "LinkedField",
                    "name": "investmentLots",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      (v4/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "price",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Investment",
                        "kind": "LinkedField",
                        "name": "investment",
                        "plural": false,
                        "selections": [
                          (v5/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "symbol",
                            "storageKey": null
                          },
                          (v6/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Transaction",
                        "kind": "LinkedField",
                        "name": "transaction",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "TransactionCategory",
                            "kind": "LinkedField",
                            "name": "category",
                            "plural": false,
                            "selections": [
                              (v5/*: any*/),
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v9/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "description",
                    "storageKey": null
                  },
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "categoryID",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "TransactionCategory",
                    "kind": "LinkedField",
                    "name": "category",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v5/*: any*/),
                      (v7/*: any*/),
                      (v8/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cursor",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PageInfo",
            "kind": "LinkedField",
            "name": "pageInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasNextPage",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endCursor",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
        "filters": [
          "where",
          "orderBy"
        ],
        "handle": "connection",
        "key": "transactionsList_transactions",
        "kind": "LinkedHandle",
        "name": "transactions"
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "TransactionCategoryConnection",
        "kind": "LinkedField",
        "name": "transactionCategories",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "TransactionCategoryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "TransactionCategory",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v5/*: any*/),
                  (v7/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1bb842919eac97da2c1dad7032e35328",
    "id": null,
    "metadata": {},
    "name": "InvestmentIdQuery",
    "operationKind": "query",
    "text": "query InvestmentIdQuery(\n  $where: TransactionWhereInput\n) {\n  ...transactionsListFragment_3FC4Qo\n}\n\nfragment editTransactionDialogCategoriesFragment on Query {\n  transactionCategories {\n    edges {\n      node {\n        id\n        name\n        type\n      }\n    }\n  }\n}\n\nfragment editTransactionDialogFragment on Transaction {\n  id\n  description\n  datetime\n  categoryID\n  category {\n    id\n    name\n    type\n    icon\n  }\n  investmentLots {\n    ...investmentLotCardFragment\n    id\n    amount\n    price\n    investment {\n      name\n      symbol\n      currency {\n        code\n        id\n      }\n      id\n    }\n  }\n  transactionEntries {\n    ...transactionEntryCardFragment\n    id\n    amount\n    account {\n      name\n      currency {\n        code\n        id\n      }\n      id\n    }\n  }\n}\n\nfragment investmentLotCardFragment on InvestmentLot {\n  id\n  amount\n  price\n  investment {\n    name\n    symbol\n    currency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    category {\n      name\n      id\n    }\n    datetime\n  }\n}\n\nfragment transactionCardFragment on Transaction {\n  transactionEntries {\n    id\n    amount\n    ...transactionEntryCardFragment\n  }\n  investmentLots {\n    id\n    amount\n    ...investmentLotCardFragment\n  }\n  ...editTransactionDialogFragment\n  category {\n    name\n    id\n  }\n}\n\nfragment transactionEntryCardFragment on TransactionEntry {\n  id\n  amount\n  account {\n    name\n    currency {\n      code\n      id\n    }\n    id\n  }\n  transaction {\n    id\n    category {\n      name\n      type\n      icon\n      id\n    }\n    datetime\n  }\n}\n\nfragment transactionsListFragment_3FC4Qo on Query {\n  transactions(first: 20, where: $where, orderBy: {field: DATETIME, direction: DESC}) {\n    edges {\n      node {\n        id\n        ...transactionCardFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  ...editTransactionDialogCategoriesFragment\n}\n"
  }
};
})();

(node as any).hash = "c4f32025e1ace0e7a64909478ef17143";

export default node;
