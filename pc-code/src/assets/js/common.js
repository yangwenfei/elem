  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'
  export default {
    dateFormat(time, fmt) {
      if (!time) {
        return "";
      }
      if (new Date(time) != 'Invalid Date') {
        time = new Date(time);
        var o = {
          "M+": time.getMonth() + 1, //月份 
          "d+": time.getDate(), //日 
          "h+": time.getHours(), //小时 
          "m+": time.getMinutes(), //分 
          "s+": time.getSeconds(), //秒 
          "q+": Math.floor((time.getMonth() + 3) / 3), //季度 
          "S": time.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
      } else {
        return time;
      }
    },
    /***
     * 获得本周起止时间
     */
    getCurrentWeek() {
      //起止日期数组  
      var startStop = new Array();
      //获取当前时间  
      var currentDate = new Date();
      //返回date是一周中的某一天  
      var week = currentDate.getDay();
      //返回date是一个月中的某一天  
      var month = currentDate.getDate();

      //一天的毫秒数  
      var millisecond = 1000 * 60 * 60 * 24;
      //减去的天数  
      var minusDay = week != 0 ? week : 6;
      //alert(minusDay);  
      //本周 周一  
      var monday = new Date(currentDate.getTime() - (minusDay * millisecond));
      //本周 周日  
      var sunday = new Date(monday.getTime() + (6 * millisecond));
      //添加本周时间  
      startStop.push(monday); //本周起始时间
      //添加本周最后一天时间  
      startStop.push(sunday); //本周终止时间  
      //返回  
      return startStop;
    },
    // 四舍五入保留n位小数
    fixNumber(num, n) {
      num = parseFloat(num);
      if (!isNaN(num)) {
        num = num.toFixed(n);
        var numArr = num.split('.');
        numArr[1] = numArr[1] ? numArr[1].replace(/0*$/gi, '') : '';
        if (numArr[1]) {
          num = numArr.join('.');
        } else {
          num = numArr[0];
          num = parseFloat(num);
        }
        return num;
      } else {
        return 0;
      }
    },
    exportExcel(htmlDoc, tableName) { //导出excel表格
      let name = tableName + ".xlsx"
      /* generate workbook object from table */
      var wb = XLSX.utils.table_to_book(htmlDoc)
      /* get binary string as output */
      var wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array'
      })
      try {
        FileSaver.saveAs(new Blob([wbout], {
          type: 'application/octet-stream'
        }), name)
      } catch (e) {
        if (typeof console !== 'undefined') console.log(e, wbout)
      }
      return wbout
    }
  }
