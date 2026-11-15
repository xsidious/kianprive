import { syncRxHereCatalog } from "../src/lib/rxhere/sync-catalog";

async function main() {
  const result = await syncRxHereCatalog({ activateNew: true });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
