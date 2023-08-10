var express = require('express');
const { serviceHandler } = require('../services/common_service');
const { checkUserMiddleware } = require('../services/middlewares');
var orderService = require('../services/order_service');
const {
	ADDORDER,
	GETORDERBYID,
	GETALLORDERS,
	GETRECENTORDERBYBUYERID,
	GETALLORDERSBYBUYERID,
	UPDATEORDERSTATUS,
	GETRECENTORDEREDPRODUCTSLISTBYBUYERID,
	GETORDERSTATUSES,
	CANCELORDER,
	GETORDEREDPRODUCTSLISTBYORDERID,
	GETINVOICE,
	GETTOTALORDERSPENDAMOUNTANDPENDINGORDERSBYBUYERID,
	ADDPENDINGORDER,
	ADDORDERWITHOUTPAYMENT,
	GETALLORDERSBYCLIENTID,
	GETTOTALORDERSCOUNTANDTOTALAMOUNTBYBUYERID,
	GETALLORDERSBYBUYERIDFILTERBYSTATUSES,
} = require('../utils/endpoints');

const router = express.Router();

router.get(GETORDERBYID, serviceHandler(orderService.getOrderByIdService));

router.get(
	GETALLORDERSBYCLIENTID,
	serviceHandler(orderService.getAllOrdersByClientIdService)
);

router.get(
	GETALLORDERSBYBUYERID,
	serviceHandler(orderService.getAllOrdersByBuyerIdService)
);

router.get(GETALLORDERS, serviceHandler(orderService.getAllOrdersService));

router.get(
	GETRECENTORDERBYBUYERID,
	serviceHandler(orderService.getRecentOrdersByBuyerIdService)
);

router.get(
	GETORDEREDPRODUCTSLISTBYORDERID,
	serviceHandler(orderService.getOrderedProductsByOrderIdService)
);

router.get(
	GETRECENTORDEREDPRODUCTSLISTBYBUYERID,
	serviceHandler(orderService.getRecentOrderedProductsListService)
);

router.get(
	GETORDERSTATUSES,
	serviceHandler(orderService.getOrderStatusesService)
);

router.get(GETINVOICE, orderService.getInvoiceService);

router.get(
	GETTOTALORDERSPENDAMOUNTANDPENDINGORDERSBYBUYERID,
	serviceHandler(orderService.getTotalOrdersAndPendingOrdersBybuyerIdService)
);

router.get(
	GETTOTALORDERSCOUNTANDTOTALAMOUNTBYBUYERID,
	serviceHandler(
		orderService.getTotalOrdersCountAndTotalAmountByBuyerIdService
	)
);

router.get(
	GETALLORDERSBYBUYERIDFILTERBYSTATUSES,
	serviceHandler(orderService.getAllOrdersByBuyerIdFilterByStatusesService)
);

router.use(checkUserMiddleware);

router.post(ADDORDER, serviceHandler(orderService.addOrderService));

router.post(
	ADDORDERWITHOUTPAYMENT,
	serviceHandler(orderService.addOrderWithoutPaymentService)
);

router.post(
	ADDPENDINGORDER,
	serviceHandler(orderService.addPendingOrderService)
);

router.put(
	UPDATEORDERSTATUS,
	serviceHandler(orderService.updateOrderStatusService)
);

router.put(CANCELORDER, serviceHandler(orderService.cancelOrderService));

module.exports = router;
