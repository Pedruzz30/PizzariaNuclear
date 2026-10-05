import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  parseVerifiedPayment,
  paymentReconciliationEventId,
  verifyMercadoPagoSignature,
} from "../src/lib/payment-verification";

test("retorno pode atualizar um pagamento pendente sem duplicar o mesmo estado", () => {
  const eventId = "return:123:order";
  assert.equal(
    paymentReconciliationEventId(eventId, "pending"),
    `${eventId}:pending`,
  );
  assert.equal(
    paymentReconciliationEventId(eventId, "approved"),
    `${eventId}:approved`,
  );
  assert.equal(
    paymentReconciliationEventId("webhook:456", "approved"),
    "webhook:456",
  );
});

test("notificação só passa com assinatura HMAC válida e ID correspondente", () => {
  const secret = "segredo-de-teste";
  const requestId = "pedido-123";
  const dataId = "123456";
  const ts = "1742505638683";
  const digest = createHmac("sha256", secret)
    .update(`id:${dataId};request-id:${requestId};ts:${ts};`)
    .digest("hex");
  const input = {
    signature: `ts=${ts},v1=${digest}`,
    requestId,
    dataId,
    secret,
  };
  assert.equal(verifyMercadoPagoSignature(input), true);
  assert.equal(
    verifyMercadoPagoSignature({ ...input, dataId: "123457" }),
    false,
  );
  assert.equal(
    verifyMercadoPagoSignature({ ...input, signature: null }),
    false,
  );
  assert.equal(
    verifyMercadoPagoSignature({ ...input, requestId: "outro" }),
    false,
  );
});

test("pagamento retornado pela API precisa ter valor, referência e modo de teste corretos", () => {
  const id = "10000000-0000-4000-8000-000000000090";
  const payment = {
    id: 123456,
    external_reference: id,
    transaction_amount: 55,
    currency_id: "BRL",
    status: "approved",
    payment_method_id: "pix",
    live_mode: false,
  };
  assert.equal(parseVerifiedPayment(payment, id, 5500).amountCents, 5500);
  assert.throws(() => parseVerifiedPayment(payment, id, 5400));
  assert.throws(() =>
    parseVerifiedPayment({ ...payment, live_mode: true }, id, 5500),
  );
  assert.throws(() =>
    parseVerifiedPayment(
      {
        ...payment,
        external_reference: "10000000-0000-4000-8000-000000000091",
      },
      id,
      5500,
    ),
  );
  assert.throws(() =>
    parseVerifiedPayment({ ...payment, currency_id: "USD" }, id, 5500),
  );
});
