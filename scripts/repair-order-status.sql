UPDATE "Order"
SET status = 'FULFILLED'
WHERE "fulfillmentStatus" IN ('FULFILLED', 'PARTIALLY_FULFILLED')
  AND status NOT IN ('FULFILLED', 'DELIVERED', 'CANCELED', 'REFUNDED');

UPDATE "Order"
SET status = 'DELIVERED'
WHERE "fulfillmentStatus" = 'DELIVERED'
  AND status <> 'DELIVERED';

SELECT "orderNumber", status, "paymentStatus", "fulfillmentStatus"
FROM "Order"
ORDER BY "createdAt" DESC
LIMIT 10;
