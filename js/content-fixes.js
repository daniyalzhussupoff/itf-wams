/* Local replacements for source links that are no longer published online. */
(function () {
  var docs = window.CONTENT && window.CONTENT.documents;
  if (!Array.isArray(docs)) return;

  var localCopies = [
    "assets/docs/protocol-1-2023-04-28.pdf",
    "assets/docs/PROTOKOL1_WAMS-1.pdf"
  ];
  var externalProtocols = docs.filter(function (doc) {
    return doc && doc.external === true;
  });

  externalProtocols.slice(0, localCopies.length).forEach(function (doc, index) {
    doc.href = localCopies[index];
    delete doc.external;
  });
})();
