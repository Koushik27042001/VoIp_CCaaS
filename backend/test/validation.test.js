import test from "node:test";
import assert from "node:assert/strict";
import { createCustomerSchema } from "../src/modules/customers/customer.validation.js";
import { outboundCallSchema } from "../src/modules/calls/call.validation.js";

test("customer validation accepts required CRM fields", () => {
  const parsed = createCustomerSchema.parse({
    body: {
      name: "Ada Lovelace",
      phone: "+15551234567",
      email: "ada@example.com",
    },
  });

  assert.equal(parsed.body.phone, "+15551234567");
});

test("customer validation rejects malformed emails", () => {
  assert.throws(() =>
    createCustomerSchema.parse({
      body: {
        name: "Ada Lovelace",
        phone: "+15551234567",
        email: "not-an-email",
      },
    })
  );
});

test("outbound call validation requires a dialable phone string", () => {
  assert.throws(() => outboundCallSchema.parse({ body: { phone: "12" } }));
  assert.equal(
    outboundCallSchema.parse({ body: { phone: "+15551234567" } }).body.phone,
    "+15551234567"
  );
});
