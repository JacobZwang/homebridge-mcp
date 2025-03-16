import { HomeBridge } from "../client";

const bridge = new HomeBridge();

await bridge.sendToolCall({
    type: "Hue",
    uniqueId: "45b9d26fa2590fc60d4a32d10717cf3b05b81a89b9a17d585725e18c66b91a8e"
}, 100);

await bridge.sendToolCall({
    type: "Hue",
    uniqueId: "f819f17fa91a3ba1019b924f8a671e8508a776e873be101a8803d50c577b40f6"
}, 100);

await bridge.sendToolCall({
    type: "Hue",
    uniqueId: "d26b760ed38cab4381d209f5829a54148ed80f39e96d215d22ed87f5ca31a8f2"
}, 100);

await bridge.sendToolCall({
    type: "Hue",
    uniqueId: "06ef58f8a898c09448ef05731799d5e7dfcb39563458611e1ead99762166beb3"
}, 100);