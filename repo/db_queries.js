const { ORDERSTATUS } = require('../utils/constants');

const CREATEORDER = `INSERT INTO tbl_order(order_id,razorpay_order_id,buyer_id,client_id,receipt,user_id,invoice_id,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;

const ADDREFUND = `INSERT INTO tbl_refund(order_id,razorpay_order_id,amount,speed_requested,notes,status) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;

const GETREFUNDDATA = `SELECT * FROM tbl_refund WHERE order_id = $1`;

const UPDATEREFUNDSTATUS = `UPDATE tbl_refund SET refund_id = $2, status = $3, updated_at = now() WHERE order_id = $1 RETURNING order_id`;

const GETORDERBYID = `SELECT o.order_id, o.razorpay_order_id,o.buyer_id,o.client_id,o.user_id,o.receipt,s.name AS "status",created_at,updated_at ,s.before_status, s.after_status,o.remarks,o.updated_by ,o.cancelled_by,o.invoice_id FROM tbl_order o JOIN tbl_status s ON o.status = s.id WHERE order_id = $1 AND buyer_id = $2 `;

const GETRECENTORDERSBYBUYERID = `SELECT o.order_id, o.razorpay_order_id,o.buyer_id,o.client_id,o.user_id,o.receipt,s.name AS "status",s.before_status, s.after_status,created_at,updated_at,o.remarks,o.updated_by,o.cancelled_by FROM tbl_order o JOIN tbl_status s ON o.status = s.id WHERE  buyer_id = $1 AND client_id=$3 ORDER BY created_at DESC LIMIT $2`;

const GETALLORDERS = `SELECT o.order_id, o.razorpay_order_id,o.buyer_id,o.client_id,o.receipt,s.name AS "status",created_at,updated_at ,s.before_status, s.after_status ,o.user_id ,cancelled_by FROM tbl_order o JOIN tbl_status s ON o.status = s.id  ORDER BY created_at DESC`;

const GETALLORDERSBYBUYERID = `SELECT o.order_id, o.razorpay_order_id,o.buyer_id,o.client_id,o.receipt,s.name AS "status",s.before_status, s.after_status,o.created_at,o.updated_at ,o.cancelled_by FROM tbl_order o JOIN tbl_status s ON o.status = s.id WHERE buyer_id = $1 ORDER BY created_at DESC`;

const UPDATEORDERSTATUS = `UPDATE tbl_order SET status = $3, updated_at = now(), updated_by = $4  WHERE  buyer_id = $1 AND order_id = $2 AND client_id =$5 RETURNING order_id, receipt ,updated_by`;

const GETLASTORDERANDAVERAGEORDERVALUE = `WITH price_result AS (
	SELECT AVG(p::NUMERIC) as average_order_value FROM tbl_order o JOIN json_extract_path_text(o.receipt,'price','totalAmountToPayAfterTax')  p ON true WHERE buyer_id = $1), 
	order_result AS (SELECT o.created_at AS last_created_at FROM tbl_order o WHERE buyer_Id = $1 ORDER BY o.created_at DESC LIMIT 1),
	order_count_result AS (SELECT COUNT(o.order_id) as total_orders_count  FROM tbl_order o WHERE buyer_Id = $1)
	SELECT order_result.last_created_at, price_result.average_order_value, order_count_result.total_orders_count FROM price_result JOIN order_result ON true JOIN order_count_result ON true`;

const GETRECENTORDEREDPRODUCTLIST = `WITH recent_order AS (
	SELECT o.order_id FROM tbl_order o WHERE buyer_id = $1 ORDER BY o.created_at DESC LIMIT 1)
	SELECT product_id,qty,o.client_id FROM tbl_order o JOIN json_array_elements(json_extract_path(o.receipt,'productList')) AS
	product_list ON true JOIN json_extract_path(product_list,'productId') AS product_id ON true JOIN recent_order ro ON true JOIN json_extract_path(product_list,'qty') AS qty ON true
	WHERE o.order_id = ro.order_id`;

const GETORDEREDPRODUCTLIST = `SELECT product_id ,qty, o.client_id FROM tbl_order o JOIN json_array_elements(json_extract_path(o.receipt,'productList')) AS
product_list ON true JOIN json_extract_path(product_list,'productId') AS product_id ON true JOIN json_extract_path(product_list,'qty') AS qty ON true
WHERE  buyer_id = $1 AND o.order_id = $2`;

const GETORDERSTATUSES = `SELECT s.id,s.name,s.before_status, s.after_status FROM tbl_status s`;

const CANCELORDER = `UPDATE tbl_order SET status = $5, updated_at = now(), cancelled_by = $3, remarks = $4 WHERE buyer_id = $1 AND order_id =  $2 RETURNING order_id, cancelled_by, receipt, razorpay_order_id`;

const GETTOTALORDERSPENDAMOUNTANDPENDINGORDERSBYBUYERID = `  WITH status_result AS (SELECT s.name,s.id FROM tbl_status s WHERE name = '${ORDERSTATUS.DELIVERED}' OR name ='${ORDERSTATUS.CANCEL}'),
amount_result AS ( SELECT SUM(REPLACE(total_paid_amount::TEXT,'"','')::NUMERIC) as total_spend_amount FROM tbl_order o JOIN json_extract_path(o.receipt,'price') AS order_prices ON true JOIN json_extract_path(order_prices,'totalAmountToPayAfterTax') AS total_paid_amount on true WHERE Exists( SELECT * FROM status_result) AND buyer_id = $1 AND status = ( SELECT id FROM status_result WHERE name = '${ORDERSTATUS.DELIVERED}')),
order_result AS (SELECT COUNT(o.status) AS pending_orders FROM tbl_order o WHERE EXISTS(SELECT * FROM status_result) AND buyer_id = $1 AND status <>  ( SELECT id FROM status_result WHERE name = '${ORDERSTATUS.DELIVERED}')  AND status <>  ( SELECT id FROM status_result WHERE name = '${ORDERSTATUS.CANCEL}'))
SELECT * FROM amount_result JOIN order_result ON true`;

const GETSTATUSBYSTATUSNAME = `SELECT s.id FROM tbl_status s WHERE name = $1`;

const GETORDERSTATUS = `SELECT o.order_id,s.name AS "status" FROM tbl_order o JOIN tbl_status s ON o.status = s.id WHERE order_id = $1 AND client_id = $2 AND buyer_id = $3 `;

const CHECKORDERCANCEL = `SELECT EXISTS( SELECT o.order_id FROM tbl_order o JOIN tbl_status s ON o.status = s.id WHERE order_id = $1  AND buyer_id = $2 AND s.name <> '${ORDERSTATUS.CANCEL}' AND s.name <> '${ORDERSTATUS.DELIVERED}')`;

const GETALLORDERSBYCLIENTID = `SELECT o.order_id, o.razorpay_order_id,o.buyer_id,o.client_id,o.user_id,o.receipt,s.name AS "status",s.before_status, s.after_status,created_at,updated_at,o.remarks,o.updated_by,o.cancelled_by FROM tbl_order o JOIN tbl_status s ON o.status = s.id WHERE client_id = $1 ORDER BY created_at DESC`;

const GETTOTALORDERSCOUNTANDTOTALAMOUNTBYBUYERID = `WITH amount_result AS ( SELECT SUM(REPLACE(total_paid_amount::TEXT,'"','')::NUMERIC) as total_spend_amount FROM tbl_order o JOIN json_extract_path(o.receipt,'price') AS order_prices ON true JOIN json_extract_path(order_prices,'totalAmountToPayAfterTax') AS total_paid_amount on true WHERE buyer_id = $1 AND status = ( SELECT s.id FROM tbl_status s WHERE s.name = '${ORDERSTATUS.DELIVERED}')),
order_result AS (SELECT COUNT(o.order_id) AS total_orders_count FROM tbl_order o WHERE o.buyer_id = $1 AND o.status IN (SELECT s.id FROM tbl_status s where s.name = '${ORDERSTATUS.DELIVERED}'))
SELECT * FROM amount_result JOIN order_result ON true`;

const GETALLORDERSBYBUYERIDFILTERBYSTATUSES = `SELECT o.order_id, o.razorpay_order_id,o.buyer_id,o.client_id,o.receipt,s.name AS "status",s.before_status, s.after_status,o.created_at,o.updated_at ,o.cancelled_by FROM tbl_order o JOIN tbl_status s ON o.status = s.id WHERE buyer_id = $1 AND status = ANY(SELECT id FROM tbl_status WHERE name = ANY($2)) ORDER BY created_at DESC LIMIT $3`;

const GETRECENTORDERBYCLIENTLIST = `SELECT DISTINCT ON(o.client_id) o.client_id FROM tbl_order o WHERE o.buyer_id = $1 ORDER BY o.client_id DESC LIMIT $2`;

module.exports = {
	GETORDEREDPRODUCTLIST,
	CREATEORDER,
	ADDREFUND,
	UPDATEREFUNDSTATUS,
	GETORDERBYID,
	GETRECENTORDERSBYBUYERID,
	GETALLORDERSBYCLIENTID,
	GETALLORDERS,
	GETALLORDERSBYBUYERID,
	UPDATEORDERSTATUS,
	GETLASTORDERANDAVERAGEORDERVALUE,
	GETRECENTORDEREDPRODUCTLIST,
	GETORDERSTATUSES,
	CANCELORDER,
	GETTOTALORDERSPENDAMOUNTANDPENDINGORDERSBYBUYERID,
	GETSTATUSBYSTATUSNAME,
	GETREFUNDDATA,
	GETORDERSTATUS,
	CHECKORDERCANCEL,
	GETTOTALORDERSCOUNTANDTOTALAMOUNTBYBUYERID,
	GETALLORDERSBYBUYERIDFILTERBYSTATUSES,
	GETRECENTORDERBYCLIENTLIST,
};
