import { isTextBlock, isSpan } from "@portabletext/schema";
function getTextBlockText(block) {
  return block.children.map((child) => child.text ?? "").join("");
}
function isEmptyTextBlock(context, block) {
  if (!isTextBlock(context, block))
    return !1;
  const onlyText = block.children.every((child) => isSpan(context, child)), blockText = getTextBlockText(block);
  return onlyText && blockText === "";
}
export {
  getTextBlockText,
  isEmptyTextBlock
};
//# sourceMappingURL=util.is-empty-text-block.js.map
