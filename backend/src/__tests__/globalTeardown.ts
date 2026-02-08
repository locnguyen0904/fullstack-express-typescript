export default async function globalTeardown() {
  const replSet = (globalThis as Record<string, unknown>).__MONGO_REPLSET__;
  if (replSet) {
    await replSet.stop();
  }
}
