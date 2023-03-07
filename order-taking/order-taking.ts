import { hasMinLength } from 'ts-array-length';
import {
  CheckProductCodeExists,
  PricedOrderLine,
  PlaceOrder,
  PricedOrder,
  PriceOrder,
  UnvalidatedOrderLine,
  ValidatedOrder,
  ValidatedOrderLine,
  ValidateOrder,
  Price,
  AcknowledgeOrder,
  OrderAcknowledgementSent,
  BillableOrderPlaced,
  PlaceOrderEvent,
  UnvalidatedOrder,
} from './order-taking.types';

function multiplyPrice(price: Price, quantity: number): Price {
  return price * quantity;
}

type FirstParameter<T extends (...args: any) => any> = Parameters<T>[0];

type ValidateOrderInner = ReturnType<ValidateOrder>;

function toValidatedOrderLine(
  orderLine: UnvalidatedOrderLine,
  checkProductCodeExists: CheckProductCodeExists
): ValidatedOrderLine {
  if (!checkProductCodeExists(orderLine.productCode)) {
    throw new Error('商品コードが存在しません');
  }
  return orderLine;
}

export function validateOrder({
  checkAddressExists,
  checkProductCodeExists,
}: FirstParameter<ValidateOrder>): ValidateOrderInner {
  function validateOrderInner(unvalidatedOrder: FirstParameter<ValidateOrderInner>): ReturnType<ValidateOrderInner> {
    const customerInfo = unvalidatedOrder.customerInfo;
    const shippingAddress = checkAddressExists(unvalidatedOrder.shippingAddress);
    const billingAddress = checkAddressExists(unvalidatedOrder.billingAddress);

    const orderLines = unvalidatedOrder.orderLines.map((orderLine) =>
      toValidatedOrderLine(orderLine, checkProductCodeExists)
    );
    if (!hasMinLength(orderLines, 1)) {
      throw new Error('注文明細は1行以上でなければなりません');
    }

    return {
      customerInfo,
      shippingAddress,
      billingAddress,
      orderLines,
    };
  }

  return validateOrderInner;
}

type PriceOrderInner = ReturnType<PriceOrder>;

export function priceOrder(getProductPrice: FirstParameter<PriceOrder>): PriceOrderInner {
  function toPricedOrderLine(orderLine: ValidatedOrderLine): PricedOrderLine {
    const price = getProductPrice(orderLine.productCode);

    return {
      price,
      productCode: orderLine.productCode,
      quantity: orderLine.quantity,
    };
  }

  function priceOrderInner(validatedOrder: ValidatedOrder): PricedOrder {
    const orderLines = validatedOrder.orderLines.map(toPricedOrderLine);
    const billingAmount = orderLines.reduce((sum, line) => sum + multiplyPrice(line.price, line.quantity), 0);

    return {
      id: undefined,
      customerInfo: validatedOrder.customerInfo,
      shippingAddress: validatedOrder.shippingAddress,
      billingAddress: validatedOrder.billingAddress,
      orderLines,
      billingAmount,
    };
  }

  return priceOrderInner;
}

type AcknowledgeOrderInner = ReturnType<AcknowledgeOrder>;

export function acknowledgeOrder({
  createOrderAcknowledgementLetter,
  sendOrderAcknowledgement,
}: FirstParameter<AcknowledgeOrder>): AcknowledgeOrderInner {
  function acknowledgeOrderInner(order: PricedOrder): OrderAcknowledgementSent | undefined {
    const letter = createOrderAcknowledgementLetter(order);
    const sendResult = sendOrderAcknowledgement({
      emailAddress: order.customerInfo.emailAddress,
      letter,
    });

    switch (sendResult) {
      case 'Sent':
        return {
          emailAddress: order.customerInfo.emailAddress,
          orderId: order.id,
        };
      case 'NotSent':
        return undefined;
    }
  }

  return acknowledgeOrderInner;
}

function optionToArray<T>(option: T | undefined): T[] {
  if (option === undefined) return [];
  return [option];
}

function createBillingEvent(order: PricedOrder): BillableOrderPlaced | undefined {
  if (order.billingAmount <= 0) return undefined;

  return {
    orderId: order.id,
    amountToBill: order.billingAmount,
    billingAddress: order.billingAddress,
  };
}

function createEvents(
  order: PricedOrder,
  acknowledgementEvent: OrderAcknowledgementSent | undefined
): PlaceOrderEvent[] {
  return [order, ...optionToArray(acknowledgementEvent), ...optionToArray(createBillingEvent(order))];
}

type PlaceOrderInner = ReturnType<PlaceOrder>;

export function placeOrder({
  checkProductCodeExists,
  checkAddressExists,
  getProductPrice,
  createOrderAcknowledgementLetter,
  sendOrderAcknowledgement,
}: FirstParameter<PlaceOrder>): PlaceOrderInner {
  return function (unvalidatedOrder: UnvalidatedOrder): PlaceOrderEvent[] {
    const validatedOrder = validateOrder({ checkProductCodeExists, checkAddressExists })(unvalidatedOrder);
    const pricedOrder = priceOrder(getProductPrice)(validatedOrder);
    const acknowledgementEventOpt = acknowledgeOrder({ createOrderAcknowledgementLetter, sendOrderAcknowledgement })(
      pricedOrder
    );

    return createEvents(pricedOrder, acknowledgementEventOpt);
  };
}
