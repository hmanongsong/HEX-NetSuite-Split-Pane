# HEX NetSuite Split Pane

HEX NetSuite Split Pane is a Suitescript library that allows users to easily toggle split pane views in NetSuite. When a link generated through this library is clicked, a split pane view will open, displaying the content of the link. The split pane view is also resizable, providing a flexible user experience.

## Installation

To use the NetSuite Split Pane Library, follow these steps:

1. Download the `HEX_LIB_SplitPane.js` file from the [GitHub repository](https://github.com/hmanongsong/HEX-NetSuite-Split-Pane).
2. Upload the file in the NetSuite File Cabinet.
3. Update the `PANE_LIB_PATH` section in the file to match the correct file directory where the library is located. By default, the location is set to the root directory of the SuiteScripts folder.

## Usage

The library provides two functions: `openSplitPane` and `generateLink`.

### `openSplitPane`

The `openSplitPane` function serves as an internal mechanism within the library to control the visibility of the split pane view. However, it can also be utilized publicly in specific scenarios. One such use case is when a user intends to display a preview of the PDF for the current transaction upon page load. To achieve this, the user can invoke the `openSplitPane` function within the `pageInit` function of the record's client script. This function accepts two parameters:

1. The URL of the page to be displayed within the split pane.
2. The width in percentage of the split pane on initial load. By default, this is set to 50.

### `generateLink`

The `generateLink` function is responsible for creating an HTML link anchor element that triggers the split pane view when clicked. It accepts three parameters:

1. The text to be displayed as the link element.
2. The URL that the link will navigate to.
3. The width in percentage of the split pane on initial load. By default, this is set to 50.

## Examples
### Displaying the PDF version of a transaction on page load

```javascript
define(['SuiteScripts/HEX_LIB_SplitPane.js'], (splitPane) => {
  const pageInit = ({currentRecord}) => {
    const tranId = currentRecord.id;
    const pdfLink = `/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&formnumber=101&id=${tranId}`;

    try {
      // Set to 45% page width
      splitPane.openSplitPane(pdfLink, 45);
    } catch (err) {
      console.log(err);
    }
  };

  return {pageInit};
});
```

<img src="https://github.com/hmanongsong/HEX-NetSuite-Split-Pane/blob/main/assets/HEX_SplitPane_PageInit.gif" />

### Dynamically creating a link in a Suitelet which opens the transaction record

```javascript
searchObj.run().each((result) => {
  const docNumber = result.getValue({ name: 'tranid' });
  const url = `/app/accounting/transactions/transaction.nl?id=${result.id}&ifrmcntnr=T`;

  sublist.setSublistValue({
    id: 'custpage_document_number',
    line: i,
    value: splitPane.generateLink(docNumber, url), // Defaults to 50% width
  });

  ...
});
```

<img src="https://github.com/hmanongsong/HEX-NetSuite-Split-Pane/blob/main/assets/HEX_SplitPane_Suitelet.gif" />

## Limitations
- **Cross-Site Scripting (XSS) Restrictions**: This library has a limitation where it cannot display links from other origins due to security restrictions imposed by Cross-Site Scripting (XSS) protection mechanisms. Therefore, it is recommended to only use links within NetSuite to ensure proper functionality.

## License
This library is licensed under the MIT License. Feel free to use, modify, and distribute it as needed.
