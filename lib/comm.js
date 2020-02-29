module.exports = {
    getTimeStr(sj){
        var now = new Date(sj);
        var   year=now.getFullYear();    
          var   month=now.getMonth()+1;    
          var   date=now.getDate();    
          var   hour=now.getHours();    
          var   minute=now.getMinutes();    
          var   second=now.getSeconds();    
          if(month<10){
              month = '0'+month
            }if(date<10){
                date = '0'+date
            }if(hour<10){
                hour = '0'+hour
            }if(minute<10){
                minute = '0'+minute
            }if(second<10){
                second = '0'+second
            }
          return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
    },
    // 生产随机码
    generateCode(){
        var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        var str = "";
        for (var i = 0; i < 8; i++) {
            if (i < 4) {
                str += letters.splice(parseInt(Math.random() * (letters.length)), 1);
            } else {
                str += numbers.splice(parseInt(Math.random() * (numbers.length)), 1);
            }
        }
        return str;
    }
}