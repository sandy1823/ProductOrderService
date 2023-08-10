const fontForInvoice = require('pdfjs/font/Helvetica');
const pdf = require('pdfjs');
const { fetchFile, chunkArray } = require('../utils/helper_tools');
const { customLogger } = require('../utils/logger');

async function generateInvoiceDoc({ invoiceId, receipt, clientData }) {
	customLogger.info({
		fileName: '/service/invoice_generation.js',
		functionName: 'generateInvoiceDoc',
		context: 'Before Execution',
		message: 'generate invoice',
	});
	const doc = new pdf.Document({
		font: fontForInvoice,
		padding: 20,
		properties: {
			title: `Invoice - ${new Date().toISOString()} ${invoiceId}`,
			author: receipt.shippingTo.buyerName.toString(),
		},
	});
	let count = 1;
	let header = doc
		.header()
		.table({
			widths: [null, null],
			paddingBottom: 0.8 * pdf.cm,
		})
		.row();
	try {
		let img = new pdf.Image(await fetchFile(clientData.logoLoc));
		header.cell().image(img, {
			height: 1 * pdf.cm,
		});
	} catch (error) {
		customLogger.error({
			fileName: '/service/invoice_generation.js',
			functionName: 'generateInvoiceDoc',
			context: 'Error Handling',
			message: error.message,
			code: error.code || error.status,
		});
		header
			.cell({
				paddingLeft: 10,
				paddingTop: 10,
			})
			.text({ height: 120 })
			.add(
				clientData.clientName?.toString().toUpperCase() ||
					'Distributer logo here',
				{
					color:
						clientData?.clientName != undefined
							? '#EB7100'
							: '#808080',
					fontSize: clientData?.clientName != undefined ? 14 : 9,
				}
			);
	}
	header
		.cell({
			paddingLeft: 120,
			paddingTop: 10,
		})
		.text({ textAlign: 'left' })
		.add(`Proforma Invoice`, {
			color: '#EB7100',
			fontSize: 14,
		});

	doc.footer().pageNumber((curr, total) => curr + ' / ' + total, {
		textAlign: 'center',
	});

	clientData.logoLoc?  doc.cell({
		textAlign: 'left',
		x: 20,
		y: 750,
		width: 390,
	}) : doc.cell({
		textAlign: 'left',
		x: 20,
		y: 770,
		width: 390,
	})
		.text()
		.add(`${receipt.shippingTo.buyerName}`, { fontSize: 11 });
	doc.cell({
		textAlign: 'left',
		x: 20,
		width: 390,
	})
		.text()
		.add(`${receipt.shippingAddress.addressName},`, { fontSize: 11 });
	doc.cell({
		textAlign: 'left',
		x: 20,
		width: 390,
	})
		.text()
		.add(`${receipt.shippingAddress.streetName},`, { fontSize: 11 });
	doc.cell({
		textAlign: 'left',
		x: 20,
		width: 390,
	})
		.text()
		.add(
			`${receipt.shippingAddress.cityName},${receipt.shippingAddress.stateName},`,
			{ fontSize: 11 }
		);
	doc.cell({
		textAlign: 'left',
		x: 20,
		width: 390,
	})
		.text()
		.add(`Pincode : ${receipt.shippingAddress.pincode},`, { fontSize: 11 });
	doc.cell({
		textAlign: 'left',
		x: 20,
		width: 390,
	})
		.text()
		.add(
			`Tel : ${receipt.shippingTo.mobileNo}, Email : ${receipt.shippingTo.userEmail}`,
			{ fontSize: 11 }
		);

	doc.cell({
		textAlign: 'left',
		x: 400,
		y: 775,
	})
		.text()
		.add(
			`Date : ${
				new Date()
					.toISOString()
					.replace(/T/, ' ')
					.replace(/\..+/, '')
					.split(' ')[0]
			}`,

			{ fontSize: 11 }
		);
	doc.cell({
		textAlign: 'left',
		x: 400,
	})
		.text()
		.add(`Invoice Id  : ${invoiceId}`, { fontSize: 11 });
	doc.cell({
		textAlign: 'left',
		x: 400,
	})
		.text()
		.add(`Client Name  : ${receipt.shippingTo.userName}`, { fontSize: 11 });

	doc.cell().text().br();

	let table;

	function createItemTable(axis) {
		table = doc.cell(axis).table({
			widths: [
				1.5 * pdf.cm,
				11 * pdf.cm,
				1.5 * pdf.cm,
				2.5 * pdf.cm,
				2.5 * pdf.cm,
			],
			borderHorizontalWidths: (i) => (i < 2 ? 1 : 0.1),
			padding: 8,
			// borderWidth: '0.5',
		});
		let tr = table.header({
			borderBottomWidth: 1.5,
		});

		tr.cell().text().add('S.No', { fontSize: 11, textAlign: 'center' });
		tr.cell()
			.text()
			.add('Product Name/Id', { fontSize: 11, textAlign: 'center' });
		tr.cell().text().add('Qty', { fontSize: 11, textAlign: 'center' });
		tr.cell()
			.text()
			.add('Unit Price (INR)', { textAlign: 'center', fontSize: 11 });
		tr.cell().text().add('Amount', { textAlign: 'center', fontSize: 11 });
	}
	function addItemRow(productName, qty, unitPrice, amount) {
		let tr = table.row();
		tr.cell()
			.text()
			.add(`${count++}`, { fontSize: 9, textAlign: 'center' });
		tr.cell().text().add(productName.toString(), { fontSize: 9 });
		tr.cell().text().add(qty.toString(), { fontSize: 9 });
		tr.cell()
			.text()
			.add(unitPrice.toString(), { textAlign: 'center', fontSize: 9 });
		tr.cell().text().add(amount, { textAlign: 'center', fontSize: 9 });
	}

	let chunkArrayList = chunkArray(receipt.productList, 15, 12);
	chunkArrayList.forEach((chunk, index) => {
		if (index === 0) {
			createItemTable({ x: 20, y: 650 });
		} else {
			createItemTable({ x: 20, y: 750 });
		}
		chunk.forEach((product) => {
			addItemRow(
				product.productName,
				product.qty,
				product.price.finalPrice,
				product.price.totalAmount
			);
		});
		if (index != chunkArrayList.length - 1) doc.pageBreak();
	});

	doc.cell().text().br();
	doc.cell({ paddingTop: 40 });

	const priceTable = doc.table({
		widths: [405, 300],
	});

	let row1 = priceTable.row({ paddingTop: 30 });

	row1.cell()
		.text({
			alignment: 'right',
		})
		.add('Total Before Tax  :');

	row1.cell({ paddingLeft: 10, textAlign: 'right', alignment: 'right' })
		.text()
		.add('INR', { fontSize: 9 })
		.add(` ${receipt.price.totalAmountToPayBeforeTax.toString()}`);

	let row2 = priceTable.row({ paddingTop: 4 });

	row2.cell()
		.text({
			alignment: 'right',
		})
		.add('Delivery Charge  :');

	row2.cell({ paddingLeft: 10, textAlign: 'right', alignment: 'right' })
		.text()
		.add('INR', { fontSize: 9 })
		.add(` ${receipt.price.deliveryCharge.toString()}`);

	let row3 = priceTable.row({ paddingTop: 4 });

	row3.cell()
		.text({
			alignment: 'right',
		})
		.add('State GST :');

	row3.cell({ paddingLeft: 10, textAlign: 'left' })
		.text()
		.add('INR', { fontSize: 9 })
		.add(` ${receipt.price.totalStateGST.toString()}`);

	let row4 = priceTable.row({ paddingTop: 4 });

	row4.cell()
		.text({
			alignment: 'right',
		})
		.add('Central GST :');

	row4.cell({ paddingLeft: 10, textAlign: 'left' })
		.text()
		.add('INR', { fontSize: 9 })
		.add(` ${receipt.price.totalCentralGST.toString()}`);

	let row5 = priceTable.row({ paddingTop: 4 });

	row5.cell()
		.text({
			alignment: 'right',
		})
		.add(`Total Amount  :`, {
			fontSize: 13,
			color: '#EB7100',
		});

	row5.cell({ paddingLeft: 10, textAlign: 'left' })
		.text()
		.add('INR', { fontSize: 9 })
		.add(` ${receipt.price.totalAmountToPayAfterTax.toString()}`, {
			textAlign: 'right',
			alignment: 'right',
			fontSize: 13,
		});
	customLogger.info({
		fileName: '/service/invoice_generation.js',
		functionName: 'generateInvoiceDoc',
		context: 'After Execution',
		message: 'generate invoice',
	});
	return doc.asBuffer();
}

module.exports = {
	generateInvoiceDoc,
};
