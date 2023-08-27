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

### Use Case 1: Loading a preview of a transaction in PDF format on page load

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime'], (runtime) => {
  /**
   * Function definition to be triggered before the record is loaded.
   *
   * @param {Object} context
   */
  const beforeLoad = (context) => {
    try {
      instantiateSplitPane(context);
    } catch (err) {
      log.error({
        title: err.name,
        details: err.message,
      });
    }
  };

  /**
   * Instantiates the Split Pane view through a User Event Script
   *
   * @param {Object} context
   */
  const instantiateSplitPane = (context) => {
    if (runtime.executionContext !== runtime.ContextType.USER_INTERFACE) {
      return;
    }

    const allowedTypes = [context.UserEventType.EDIT, context.UserEventType.VIEW];

    if (context.type.includes(allowedTypes)) {
      return;
    }

    const recordId = context.newRecord.id;
    const pageLink = `/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&formnumber=92&trantype=custinvc&&label=Invoice&printtype=transaction&id=${recordId}`;

    const splitPaneHTML = context.form.addField({
      id: 'custpage_hex_splitpane',
      label: 'Split Pane',
      type: 'inlinehtml',
    });
    splitPaneHTML.defaultValue = `
      <script>
        require(['SuiteScripts/HEX_LIB_SplitPane.js'], (splitPane) => {
          splitPane.openSplitPane('${pageLink}', 30);
        });
      </script>`;
  };
  return {
    beforeLoad,
  };
});
```

<img src="https://github.com/hmanongsong/HEX-NetSuite-Split-Pane/blob/main/assets/HEX_SplitPane_UE.gif" />

### Use Case 2: Loading a record’s attachment in the split pane on button click

User Event Script
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/runtime'], (runtime) => {
  /**
   * Function definition to be triggered before record is loaded.
   *
   * @param {Object} context
   */
  const beforeLoad = (context) => {
    try {
      context.form.addButton({
        id: 'custpage_hex_splitpane',
        label: 'Open Most Recent Attachment',
        functionName: 'openMostRecentAttachment',
      });

      context.form.clientScriptModulePath = 'SuiteScripts/HEX_CS_Invoice.js';
    } catch (err) {
      log.error({
        title: err.name,
        details: err.message,
      });
    }
  };

  return {
    beforeLoad,
  };
});
```

Client Script
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/currentRecord', 'N/search', 'SuiteScripts/HEX_LIB_SplitPane.js'], (
  currentRecord,
  search,
  splitPane
) => {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} context
   */
  const openMostRecentAttachment = () => {
    const currentRec = currentRecord.get();
    const fileURL = getMostRecentAttachmentURL(currentRec.id);

    try {
      splitPane.openSplitPane(fileURL);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Retrieves the most recent attachment of the current invoice record
   *
   * @param {Object} context
   */
  const getMostRecentAttachmentURL = (invoiceId) => {
    const fileSearch = search
      .create({
        type: search.Type.INVOICE,
        filters: [
          search.createFilter({
            name: 'internalid',
            operator: search.Operator.ANYOF,
            values: [invoiceId],
          }),
          search.createFilter({
            name: 'mainline',
            operator: search.Operator.IS,
            values: ['T'],
          }),
        ],
        columns: [
          search.createColumn({name: 'url', join: 'file'}),
          search.createColumn({
            name: 'created',
            join: 'file',
            sort: search.Sort.DESC,
          }),
        ],
      })
      .run()
      .getRange({start: 0, end: 1});

    const fileURL = fileSearch[0]?.getValue({name: 'url', join: 'file'});

    return fileURL;
  };

  return {
    pageInit: () => {},
    openMostRecentAttachment,
  };
});
```

<img src="https://github.com/hmanongsong/HEX-NetSuite-Split-Pane/blob/main/assets/HEX_SplitPane_CS_UE.gif" />

### Use Case 3: Loading records in the split pane through a Suitelet link

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
