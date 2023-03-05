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
type CheckAddressExists = (address: UnvalidatedAddress) => ResultAsync<ValidatedAddress, string>;

type OrderForm = undefined;
type CustomerInfo = undefined;
type BillingAmount = undefined;
type ProductCatalog = undefined;

type UnvalidatedOrderLine = {
  productCode: ProductCode;
  quantity: OrderQuantity;
};

type UnvalidatedOrder = {
  customerInfo: CustomerInfo;
  shippingAddress: UnvalidatedAddress;
  billingAddress: UnvalidatedAddress;
  orderLines: UnvalidatedOrderLine[];
};

type ValidatedOrderLine = UnvalidatedOrderLine;

type ValidatedOrder = {
  customerInfo: CustomerInfo;
  shippingAddress: ValidatedAddress;
  billingAddress: ValidatedAddress;
  orderLines: NonEmptyArray<ValidatedOrderLine>;
};

type CheckProductCodeExists = (productCode: ProductCode) => boolean;

// サブステップ: 注文を検証する
export type ValidateOrder = (dependencies: {
  checkProductCodeExists: CheckProductCodeExists;
  checkAddressExists: CheckAddressExists;
}) => (order: UnvalidatedOrder) => ResultAsync<ValidatedOrder, ValidationError[]>;

type OrderId = undefined;
type OrderLineId = undefined;
type CustomerId = undefined;
type Price = undefined;

type OrderLine = {
  id: OrderLineId;
  orderId: OrderId;
  productCode: ProductCode;
  quantity: OrderQuantity;
  price: Price;
};

type PricedOrder = {
  id: OrderId;
  customerId: CustomerId;
  shippingAddress: ValidatedAddress;
  billingAddress: ValidatedAddress;
  orderLines: OrderLine[];
  billingAmount: BillingAmount;
};

type GetProductPrice = (code: ProductCode) => Price;

// サブステップ: 注文の価格を計算する
export type PriceOrder = (getProductPrice: GetProductPrice) => (order: UnvalidatedOrder) => PricedOrder;

type OrderPlaced = PricedOrder;
type BillableOrderPlaced = {
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
type SendOrderAcknowledgement = (acknowledgement: OrderAcknowledgement) => Promise<SendResult>;

type OrderAcknowledgementSent = {
  orderId: OrderId;
  emailAddress: EmailAddress;
};

// サブステップ: 注文の確認を顧客に伝える
type AcknowledgeOrder = (dependencies: {
  createOrderAcknowledgementLetter: CreateOrderAcknowledgementLetter;
  sendOrderAcknowledgement: SendOrderAcknowledgement;
}) => (order: PricedOrder) => Promise<OrderAcknowledgementSent | undefined>;

type PlaceOrderInputs = {
  orderForm: OrderForm;
  productCatalog: ProductCatalog;
};

type PlaceOrderEvent = OrderPlaced | BillableOrderPlaced | OrderAcknowledgementSent;
type PlaceOrderError = ValidationError[];

// ワークフロー: 注文する
export type PlaceOrder = (input: PlaceOrderInputs) => ResultAsync<PlaceOrderEvent[], PlaceOrderError>;
