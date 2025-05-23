
/*API驗證碼*/
const apiKey = "CWA-96733B18-4DC5-490D-9E7A-0AE6702E2F55";
let data; // Variable to store weather data
let cityNum = 0; // Default city index
/*嘉義縣天氣url碼*/
const apiUrl = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-031?Authorization=" + apiKey + "&format=JSON&locationName=中埔鄉&elementName=&sort=time";  // Fetch weather data from the API
$.ajax({
    url: apiUrl,
    method: "GET",
    dataType: "json",
    success: function (res) {
        data = res.records.locations[0];
        weekWeather(data, cityNum);
    }
});
const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
// 根據讀到的天氣資訊選擇要顯示的圖
function changeImg(weatherDescription) {
    let imgSrc = "./images/天氣image/";

    switch (true) {
        case weatherDescription.includes('晴天'):
            imgSrc += "晴天.png";
            break;
        case weatherDescription.includes('晴時多雲'):
            imgSrc += "晴時多雲.png";
            break;
        case weatherDescription.includes('多雲時晴'):
            imgSrc += "多雲時晴.png";
            break;
        case weatherDescription.includes('多雲'):
            imgSrc += "多雲.png";
            break;
        case weatherDescription.includes('多雲時陰'):
            imgSrc += "多雲時陰.png";
            break;
        case weatherDescription.includes('陰時多雲'):
            imgSrc += "陰時多雲.png";
            break;
        case weatherDescription.includes('陰天'):
            imgSrc += "陰天.png";
            break;
        case weatherDescription.includes('多雲陣雨') || weatherDescription.includes('多雲短暫雨') || weatherDescription.includes('多雲短暫陣雨'):
            imgSrc += "多雲陣雨.png";
            break;
        case weatherDescription.includes('多雲時陰短暫雨') || weatherDescription.includes('多雲時陰短暫陣雨'):
            imgSrc += "多雲時陰短暫雨.png";
            break;
        case weatherDescription.includes('陰時多雲短暫雨') || weatherDescription.includes('陰時多雲短暫陣雨'):
            imgSrc += "陰時多雲短暫陣雨.png";
            break;
        case weatherDescription.includes('雨天') || weatherDescription.includes('晴午後陰短暫雨'):
            imgSrc += "雨天.png";
            break;
        case weatherDescription.includes('多雲時陰有雨') || weatherDescription.includes('多雲時陰陣雨'):
            imgSrc += "多雲時陰有雨.png";
            break;
        case weatherDescription.includes('陰時多雲有雨') || weatherDescription.includes('陰時多雲有陣雨'):
            imgSrc += "陰時多雲有雨.png";
            break;
        case weatherDescription.includes('陰有雨') || weatherDescription.includes('陰有陣雨') || weatherDescription.includes('陰雨') || weatherDescription.includes('陰陣雨') || weatherDescription.includes('陣雨') || weatherDescription.includes('午後陣雨') || weatherDescription.includes('有雨'):
            imgSrc += "陰有雨.png";
            break;
        case weatherDescription.includes('多雲陣雨或雷雨') || weatherDescription.includes('多雲短暫陣雨或雷雨') || weatherDescription.includes('多雲短暫雷陣雨'):
            imgSrc += "多雲陣雨或雷雨.png";
            break;

        default:
            imgSrc += "下雨.png";
            break;
    }

    return `<img class="weather-img" src="${imgSrc}" alt="weather-image">`;
}
// 一週天氣Function
function weekWeather(data, cityNum) {
    $('#weatherNow').html('');
    const chooseCity = data.location[cityNum].locationName;
    const tableRows = $('.day-info');
    const today = new Date(); // Get今天日期
    const oneDay = 24 * 60 * 60 * 1000; // 一天的秒數
    for (let i = 0; i < 7; i++) {
        const timeIndex = 2 * i;
        const weather = data.location[cityNum].weatherElement;
        const weatherDescription = weather[6].time[timeIndex].elementValue[0].value;
        const weatherTemp = data.location[cityNum].weatherElement[1].time[timeIndex].elementValue[0].value;
        const weatherImg = changeImg(weatherDescription);
        const maxTemp = data.location[cityNum].weatherElement[12].time[timeIndex].elementValue[0].value; // 提取最高温度
        const minTemp = data.location[cityNum].weatherElement[8].time[timeIndex].elementValue[0].value; // 提取最低温度
        const row = tableRows[i];
        const day = new Date(today.getTime() + i * oneDay);
        const dayName = getDayName(day);
        const formattedDate = getFormattedDate(day);
        row.setAttribute('data-other-info', `降水量: ${weather[1].time[timeIndex].elementValue[0].value} mm\n體感溫度: ${weather[3].time[timeIndex].elementValue[0].value} °C\n紫外線指數: ${weather[5].time[timeIndex].elementValue[0].value}\n能見度: ${weather[7].time[timeIndex].elementValue[0].value} km\n`);

        if (i === 0) {
            row.innerHTML = `
                         <td>
                         <span style="color: dark green;">中埔鄉</span>
                             ${weatherImg}
                             <div>
                                 <p>今天</p>
                                 <div class="today-weather">${weatherDescription}</div>
                                 <p>${minTemp}  °C-${maxTemp}°C</p>
                             </div>
                         </td>
                     `;
        } else {
            row.innerHTML = `
                         <td>
                             ${weatherImg}
                         </td>
                         <td>
                            <p>${minTemp}  °C-${maxTemp}°C</p>
                             <div class="week-description">${weatherDescription}</div>
                             <p>${formattedDate} 星期${dayName}</p>
                         </td>
                     `;
        }
    }
}
//根據日期取得星期幾的名稱
function getDayName(date) {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[date.getDay()];
}
//根據日期取得格式化後的日期字符串
function getFormattedDate(date) {
    const month = date.getMonth() + 1; // 加1是因為一月是0
    const day = date.getDate();
    return `${month}月${day}號`;
}


// 為每個 .day-info 元素添加滑鼠懸停事件監聽器
$('.day-info').on('mouseover', function (event) {
    const x = event.clientX;
    const y = event.clientY;

    const infoBox = this.getAttribute('data-other-info');
    this.style.setProperty('--info-box-left', `${x}px`);
    this.style.setProperty('--info-box-top', `${y}px`);
});



