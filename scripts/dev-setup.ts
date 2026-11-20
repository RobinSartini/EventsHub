import { prepare, prepareDatabase, stopAppContainers } from "./stack";

await prepare();
await stopAppContainers();
await prepareDatabase();
