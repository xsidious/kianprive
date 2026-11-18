-- Preserve order history: rename legacy RxHere column to Eventide.
ALTER TABLE "Order" RENAME COLUMN "rxhereOrderId" TO "eventideOrderId";
