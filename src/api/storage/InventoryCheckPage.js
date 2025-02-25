import request from "@/utils/request";
// 前缀
import { PORT4 } from "@/api/config";
// 库存 箱名维度
export function selBulkInventoryList(params) {
    return request({
        isWms: true,
        url: PORT4 + "/storage/wmsStorageInventoryFlow/bulkInventoryList",
        method: "get",
        params,
    });
}