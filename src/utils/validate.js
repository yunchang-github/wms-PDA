export function isvalidPhone(str) {
  const reg = /^(\\+\\d{2}-)?(\\d{2,3}-)?([1][3,4,5,7,8][0-9]\\d{8})$/;
  return reg.test(str);
}
export function formatDate(formatStr, fdate) {
  let fTime, fStr = 'ymdhis';
  if (!formatStr)
    formatStr = "y-m-d h:i:s";
  if (fdate)
    fTime = new Date(fdate);
  else
    fTime = new Date();
  let formatArr = [
    fTime.getFullYear().toString(),
    ((fTime.getMonth() + 1) < 10 ? '0' + (fTime.getMonth() + 1) : (fTime.getMonth() + 1)).toString(),
    (fTime.getDate() < 10 ? "0" + fTime.getDate() : fTime.getDate()).toString(),
    (fTime.getHours() < 10 ? "0" + fTime.getHours() : fTime.getHours()).toString(),
    (fTime.getMinutes() < 10 ? "0" + fTime.getMinutes() : fTime.getMinutes()).toString(),
    (fTime.getSeconds() < 10 ? "0" + fTime.getSeconds() : fTime.getSeconds()).toString()
  ];
  for (let i = 0; i < formatArr.length; i++) {
    formatStr = formatStr.replace(fStr.charAt(i), formatArr[i]);
  }

  return formatStr
}
