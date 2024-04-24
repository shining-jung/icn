// APi - 인천국제공항공사_여객편 주간 운항 현황 (출발)
const creatHtml = (data) => {
    const item = data.Master;
    let estimatedDateTime = `${item.estimatedDateTime.substring(8, 10)} : ${item.estimatedDateTime.substring(10, 12)}`;
    let scheduleDate = `${item.scheduleDateTime.substring(8, 10)} : ${item.scheduleDateTime.substring(10, 12)}`;
    let terminal = '';
    if (item.terminalid === 'P01') {
        terminal = `T1`;
    } else if (item.terminalid === 'P02') {
        terminal = 'T1 - 탑승동';
    } else if (item.terminalid === 'P03') {
        terminal = 'T2 ';
    }
    let remarkCode = '';
    if (item.remark === '출발') {
        remarkCode = 'step01';
    } else if (item.remark === '결항') {
        remarkCode = 'step02';
    } else if (item.remark === '지연') {
        remarkCode = 'step03';
    } else if (item.remark === '탑승중') {
        remarkCode = 'step04';
    } else if (item.remark === '마감예정') {
        remarkCode = 'step05';
    } else if (item.remark === '탑승마감') {
        remarkCode = 'step06';
    } else if (item.remark === '탑승준비') {
        remarkCode = 'step07';
    }

    const airlineCodeString = `${item.flightId.substring(0, 2)}`;
    const airlineCodeNum = `${item.flightId.substring(2, 8)}`;
    const slave = data.Slaves;
    let slaveItem = slave.map((sl) => `<span>${sl.airline} (${sl.flightId})</span>`).join('');
    let slaveHtml =
        slave.length > 0
            ? `     
            <div class="codeShare">
                <strong>이 항공편은 <span>${item.airline}</span>에서 공동운항하는 항공편입니다. (<span>${slave.length}개</span>의 항공사)</strong>
                <div class="slaveList">${slaveItem}</div>
            </div>
            `
            : '';

    return `
        <li class="${remarkCode}">
            <div class="rowItem" data-adate="${item.scheduleDateTime.substring(0, 8)}"  data-terminal="${item.terminalid}" data-scTime="${item.scheduleDateTime.substring(8, 10)}" >
                <div class="itemTerminal">${terminal}</div>
                <div class="itemTime">
                    ${
                        item.estimatedDateTime !== item.scheduleDateTime ? `<span class="delayTime">${scheduleDate}</span><strong>${estimatedDateTime}</strong>` : `<strong>${scheduleDate}</strong>`
                    }      
                    <span>${
                        item.estimatedDateTime !== item.scheduleDateTime
                            ? `${item.estimatedDateTime.substring(4, 6)}월 ${item.estimatedDateTime.substring(6, 8)}일`
                            : `${item.scheduleDateTime.substring(4, 6)}월 ${item.scheduleDateTime.substring(6, 8)}일`
                    }</span>
                </div>
                <div class="itemDestination">
                    <strong>${item.airport}</strong>
                    <span>(${item.airportCode})</span>
                </div>
                <div class="itemAirline ${airlineCodeString}">
                    <div>
                        <img src="../common/img/${airlineCodeString}.png"  
                            onerror="this.onerror=null; this.src='../common/img/no_img.png';">
                    </div>
                    <span>${item.airline}</span>
                </div>
                <div class="itemFlightId">
                    ${item.flightId}
                </div>                      
                <div class="itemchkin">
                    ${item.chkinrange}
                </div>           
                <div class="itemGate">
                    ${item.gatenumber}
                </div>  
                <div class="itemReMark">                
                    ${!item.remark ? '-' : `<span>${item.remark}</span>`}
                </div>    
                ${slaveHtml}            
            </div>
        </li>
    `;
};

//첫번째 api
const getLatestDatas = async () => {
    document.querySelector('.loadingWrap').style.display = 'flex';
    thisKey.day = formattedToday.fullDate + formattedToday.hours;
    const url = new URL(`https://apis.data.go.kr/B551177/StatusOfPassengerFlightsDSOdp/getPassengerDeparturesDSOdp?serviceKey=${API_KEY}&type=json`);
    try {
        const response = await fetch(url);
        const data = await response.json();
        dataList = data.response.body.items;
        dataList = newDataList(dataList);
        pageData(dataList, page, pageSize, thisKey.day);
    } catch (error) {
        console.error(error);
    } finally {
        document.querySelector('.loadingWrap').style.display = 'none';
    }
};

// 두번쨰 API 호출
const CongestionLevelStep = (T) => {
    if (T < 7000) {
        return ['step01', '최소 <strong>출발 2시간 전</strong>에 체크인 카운터에 도착하세요.'];
    } else if (T > 7000 || T < 7600) {
        return ['step02', '최소 <strong>출발 2시간 전</strong>에 체크인 카운터에 도착하세요.'];
    } else if (T > 7601 || T < 8200) {
        return ['step03', '최소 <strong>출발 2시간 30분 전</strong>에 체크인 카운터에 도착하세요.'];
    } else if (T > 8201 || T < 8600) {
        return ['step04', '최소 <strong>출발 3시간 전</strong>에 체크인 카운터에 도착하세요.'];
    } else if (T > 8601) {
        return ['step05', '최소 <strong>출발 3시간 전</strong>에 체크인 카운터에 도착하세요.'];
    }
};
const creatRowItemsSiblingDiv = (data, terminal) => {
    const T1Congestion = Math.trunc(data.t1sumset2);
    const T1CongestionLevelStep = CongestionLevelStep(T1Congestion);
    const T2Congestion = Math.trunc(data.t2sumset2);
    const T2CongestionLevelStep = CongestionLevelStep(T2Congestion);
    let currentDataT1 = `
            <p>[출국장 별 예상 혼잡도]</p>
            <p class="totalLevel ${T1CongestionLevelStep[0]}">총 예상인원 : <strong>${T1Congestion}명</strong></p>             
            <span>2번 : <strong>${Math.trunc(data.t1sum5)}명</strong> / </span>
            <span>3번 :  <strong>${Math.trunc(data.t1sum6)}명</strong> / </span>
            <span>4번 :  <strong>${Math.trunc(data.t1sum7)}명</strong> / </span>
            <span>5번 :  <strong>${Math.trunc(data.t1sum8)}명</strong></span>   
            <p class="dec arrival">${T1CongestionLevelStep[1]}</p>     
            <p class="dec t_line">1번, 6번 출국장은 교통약자 우대출구로, 공항 예상혼잡도 대상에서 제외됩니다.</p>      
    `;
    let currentDataT2 = `   
            <p>[출국장 별 예상 혼잡도]</p>
            <p class="totalLevel ${[T2CongestionLevelStep[0]]}">총 예상인원 : <strong>${T2Congestion}명</strong></p>              
            <span>1번 : <strong>${Math.trunc(data.t2sum3)}명</strong> / </span>
            <span>2번 : <strong>${Math.trunc(data.t2sum4)}명</strong></span>    
            <p>${T2CongestionLevelStep[1]}</p>          
    `;
    if (terminal == 'P01') {
        return `
            <div>
                ${currentDataT1}  
            </div>  
        `;
    } else if (terminal == 'P02') {
        return `
            <div>
                ${currentDataT1}
                <p class="dec">이 항공편은 셔틀트레인을 이용하여 이동하는 탑승동에서 출발합니다.  </p>
                <p class="dec">탑승 시간 10분전까지 탑승동으로 이동해주세요.  </p>               
            </div>    
        `;
    } else if (terminal == 'P03') {
        return `
            <div>
                ${currentDataT2}
            </div>    
        `;
    }
};

// 이벤트 리스너
getLatestDatas();
getLatesCongestionDatas();

dateSelect.addEventListener('change', (e) => {
    let thisValue = e.target.value;
    thisKey.day = thisValue;
    const todayHours = formattedToday.hours;
    if (thisValue !== formattedToday.fullDate) {
        timeStSelect.selectedIndex = 0;
    } else {
        for (let i = 0; i < timeStSelect.options.length; i++) {
            if (timeStSelect.options[i].value.startsWith(todayHours)) {
                timeStSelect.selectedIndex = i;
                thisKey.day = formattedToday.fullDate + timeStSelect.options[i].value;
                return pageData(dataList, page, pageSize, thisKey.day);
            }
        }
    }
    pageData(dataList, page, pageSize, thisKey.day);
});
timeStSelect.addEventListener('change', (e) => {
    thisKey.day = dateSelect.value + e.target.value;
    pageData(dataList, page, pageSize, thisKey.day);
});

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchFn();
    }
});
searchBtn.addEventListener('click', () => {
    searchFn();
});
