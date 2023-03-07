import { z } from 'zod';
import { Result, ResultAsync } from 'neverthrow';
import { NonEmptyArray } from '../utils/type';

type ValidationError = {
  field: string;
  description: string;
};

const WidgetCode = z
  .string()
  .regex(/^W\d{4}$/)
  .brand<'WidgetCode'>();
const GizmoCode = z.string().brand<'GizmoCode'>();
const ProductCode = z.union([WidgetCode, GizmoCode]);

type ProductCode = z.infer<typeof ProductCode>;

const UnitQuantity = z.number().brand<'UnitQuantity'>();
const KilogramQuantity = z.number().brand<'KilogramQuantity'>();
const OrderQuantity = z.union([UnitQuantity, KilogramQuantity]);

type UnitQuantity = z.infer<typeof UnitQuantity>;
type OrderQuantity = z.infer<typeof OrderQuantity>;

type UnvalidatedAddress = undefined;
type ValidatedAddress = undefined;
type CheckAddressExists = (address: UnvalidatedAddress) => ValidatedAddress;

type OrderForm = undefined;
type PersonName = {
  firstName: string;
  lastName: string;
};
type CustomerInfo = {
  name: PersonName;
  emailAddress: EmailAddress;
};
export type Price = number;
type BillingAmount = Price;
type ProductCatalog = undefined;

export type UnvalidatedOrderLine = {
  productCode: ProductCode;
  quantity: OrderQuantity;
};

export type UnvalidatedOrder = {
  customerInfo: CustomerInfo;
  shippingAddress: UnvalidatedAddress;
  billingAddress: UnvalidatedAddress;
  orderLines: UnvalidatedOrderLine[];
};

export type ValidatedOrderLine = UnvalidatedOrderLine;

export type ValidatedOrder = {
  customerInfo: CustomerInfo;
  shippingAddress: ValidatedAddress;
  billingAddress: ValidatedAddress;
  orderLines: NonEmptyArray<ValidatedOrderLine>;
};

export type CheckProductCodeExists = (productCode: ProductCode) => boolean;

// サブステップ: 注文を検証する
export type ValidateOrder = (dependencies: {
  checkProductCodeExists: CheckProductCodeExists;
  checkAddressExists: CheckAddressExists;
}) => (order: UnvalidatedOrder) => ValidatedOrder;

type OrderId = undefined;
type OrderLineId = undefined;
type CustomerId = undefined;

export type PricedOrderLine = {
  // id: OrderLineId;
  // orderId: OrderId;
  productCode: ProductCode;
  quantity: OrderQuantity;
  price: Price;
  // linePrice: Price;
};

export type PricedOrder = {
  id: OrderId;
  customerInfo: CustomerInfo;
  shippingAddress: ValidatedAddress;
  billingAddress: ValidatedAddress;
  orderLines: PricedOrderLine[];
  billingAmount: BillingAmount;
};

type GetProductPrice = (code: ProductCode) => Price;

// サブステップ: 注文の価格を計算する
export type PriceOrder = (getProductPrice: GetProductPrice) => (order: ValidatedOrder) => PricedOrder;

type OrderPlaced = PricedOrder;
export type BillableOrderPlaced = {
  orderId: OrderId;
  billingAddress: ValidatedAddress;
  amountToBill: BillingAmount;
};

type HtmlString = string;
type EmailAddress = string;

type OrderAcknowledgement = {
  emailAddress: EmailAddress;
  letter: HtmlString;
};

type CreateOrderAcknowledgementLetter = (order: PricedOrder) => HtmlString;
type SendResult = 'Sent' | 'NotSent';
type SendOrderAcknowledgement = (acknowledgement: OrderAcknowledgement) => SendResult;

export type OrderAcknowledgementSent = {
  orderId: OrderId;
  emailAddress: EmailAddress;
};

// サブステップ: 注文の確認を顧客に伝える
export type AcknowledgeOrder = (dependencies: {
  createOrderAcknowledgementLetter: CreateOrderAcknowledgementLetter;
  sendOrderAcknowledgement: SendOrderAcknowledgement;
}) => (order: PricedOrder) => OrderAcknowledgementSent | undefined;

type PlaceOrderInputs = {
  orderForm: OrderForm;
  productCatalog: ProductCatalog;
};

export type PlaceOrderEvent = OrderPlaced | BillableOrderPlaced | OrderAcknowledgementSent;
type PlaceOrderError = ValidationError[];

// ワークフロー: 注文する
export type PlaceOrder = (dependencies: {
  checkProductCodeExists: CheckProductCodeExists;
  checkAddressExists: CheckAddressExists;
  getProductPrice: GetProductPrice;
  createOrderAcknowledgementLetter: CreateOrderAcknowledgementLetter;
  sendOrderAcknowledgement: SendOrderAcknowledgement;
}) => (unvalidatedOrder: UnvalidatedOrder) => PlaceOrderEvent[];
