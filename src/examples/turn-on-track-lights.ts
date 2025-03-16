import { HomeBridge } from "../client";

const bridge = new HomeBridge();

await bridge.sendToolCall({
    type: "On",
    uniqueId: "45b9d26fa2590fc60d4a32d10717cf3b05b81a89b9a17d585725e18c66b91a8e"
}, "1");

await bridge.sendToolCall({
    type: "On",
    uniqueId: "f819f17fa91a3ba1019b924f8a671e8508a776e873be101a8803d50c577b40f6"
}, "1");

await bridge.sendToolCall({
    type: "On",
    uniqueId: "d26b760ed38cab4381d209f5829a54148ed80f39e96d215d22ed87f5ca31a8f2"
}, "1");

