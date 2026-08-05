"use strict";

function normalizeSyntax(syntax, defaultSyntax) {
  syntax ??= defaultSyntax;
  if (syntax == "md") syntax = "html";
  if (syntax == "mdx") syntax = "jsx";
  return syntax;
}

module.exports = {
  normalizeSyntax
};
