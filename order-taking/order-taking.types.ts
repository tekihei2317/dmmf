import { z } from 'zod';
import { Result, ResultAsync } from 'neverthrow';

type ValidationError = {
  field: string;
  description: string;
};

const WidgetCode = z.string().brand<'WidgetCode'>();
const GizmoCode = z.string().brand<'GizmoCode'>();
const ProductCode = z.union([WidgetCode, GizmoCode]);

type ProductCode = z.infer<typeof ProductCode>;

const UnitQuantity = z.number().brand<'UnitQuantity'>();
const KilogramQuantity = z.number().brand<'KilogramQuantity'>();
const OrderQuantity = z.union([UnitQuantity, KilogramQuantity]);

type OrderQuantity = z.infer<typeof OrderQuantity>;

type OrderForm = undefined;
type CustomerInfo = undefined;
type Address = undefined;
type BillingAmount = undefined;
type ProductCatalog = undefined;

type UnvalidatedOrderLine = {
  productCode: ProductCode;
  quantity: OrderQuantity;
};

type UnvalidatedOrder = {
  customerInfo: CustomerInfo;
  shippingAddress: Address;
  billingAddress: Address;
  orderLines: UnvalidatedOrderLine[];
};

type ValidatedOrderLine = UnvalidatedOrderLine;

type ValidatedOrder = {
  customerInfo: CustomerInfo;
  shippingAddress: Address;
  billingAddress: Address;
  orderLines: ValidatedOrderLine[];
};

// TODO: 商品コードの確認と、住所が存在するかの確認ができるようにする
export type ValidateOrder = (order: UnvalidatedOrder) => ResultAsync<ValidatedOrder, ValidationError[]>;

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

type Order = {
  id: OrderId;
  customerId: CustomerId;
  shippingAddress: Address;
  billingAddress: Address;
  orderLines: OrderLine[];
  billingAmount: BillingAmount;
};

type CalculatePriceInput = {
  form: OrderForm;
  productCatalog: ProductCatalog;
};

type CalculatePriceError = undefined;

// TODO: 商品カタログの代わりに、商品の価格を取得する関数を使う
export type CalculatePrice = (input: CalculatePriceInput) => Result<Order, CalculatePriceError>;

type PlaceOrderInputs = {
  orderForm: OrderForm;
  productCatalog: ProductCatalog;
};

type PlaceOrderEvents = {
  acknowledgementSent: undefined;
  orderPlaced: undefined;
  billableOrderPlaced: undefined;
};

type PlaceOrderError = ValidationError[];

export type PlaceOrder = (input: PlaceOrderInputs) => ResultAsync<PlaceOrderEvents, PlaceOrderError>;
