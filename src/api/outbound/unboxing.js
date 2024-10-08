import request from "@/utils/request";
// 前缀
import { PORT4 } from "@/api/config";


// FBA列表完成拣货
export function devanningBoxFun(data) {
    return request({
        url: PORT4 + "/storage/wmsOutboundStockOut/devanning",
        method: "post",
        types: 'json',
        data,
        isShowLoading: true
    });
}