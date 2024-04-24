const dateSelect = document.querySelector('.dateSelect');
const timeStSelect = document.querySelector('.timeStSelect');
const searchBtn = document.querySelector('.SearchBtn');
const rowItem = document.querySelectorAll('.depList .rowItem');
const searchInput = document.querySelector('.searchInput');
const depList = document.querySelector('.depList');
const pagenation = document.querySelector('.pagenation');
const API_KEY = '%2FmscJncDu6YppORaZq5cr5I9s51kLjfqnJUdepqiI54DmeIIxaoiUL24BVfuxZmu9dSDOniYt6EPC8oVWxzGtg%3D%3D';

let thisKey = {
    keyword: '',
    day: '',
};
let pageSize = 10;
let page = 1;
let groupSize = 5;

let dataList;
let densityData;
let densityData1;
let densityData2;

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const formattedToday = getDayKr(today);
const formattedTomorrow = getDayKr(tomorrow);

dateSelect.innerHTML = `
    <option value="${formattedToday.fullDate}">${formattedToday.year}년${formattedToday.month}월${formattedToday.date}일(${formattedToday.day}요일)</option>
    <option value="${formattedTomorrow.fullDate}">${formattedTomorrow.year}년${formattedTomorrow.month}월${formattedTomorrow.date}일(${formattedTomorrow.day}요일)</option>
`;

//셀렉트 박스
const creatTimeStVal = () => {
    let options = '';
    const todayHours = Number(formattedToday.hours);
    for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}` : `${i}`;
        const selected = i === todayHours ? ' selected' : '';
        options += `<option value="${hour}" ${selected}>${hour}:00</option>`;
    }
    return options;
};
timeStSelect.innerHTML = creatTimeStVal();

function getDayKr(dayItem) {
    const year = dayItem.getFullYear();
    const month = dayItem.getMonth() + 1;
    const date = dayItem.getDate();
    const day = ['일', '월', '화', '수', '목', '금', '토'][dayItem.getDay()];
    const hours = dayItem.getHours();
    const minutes = dayItem.getMinutes();
    return {
        year,
        month: month < 10 ? `0${month}` : month,
        date: date < 10 ? `0${date}` : date,
        day,
        hours: hours < 10 ? `0${hours}` : hours,
        minutes: minutes < 10 ? `0${minutes}` : minutes,
        fullDate: `${year}${month < 10 ? `0${month}` : month}${date < 10 ? `0${date}` : date}`,
    };
}

//검색
const searchFn = () => {
    const keyword = searchInput.value;
    thisKey.keyword = keyword;
    if (!keyword) {
        thisKey.day = formattedToday.fullDate + formattedToday.hours;
    } else {
        thisKey.day = dateSelect.value + timeStSelect.value;
    }
    pageData(dataList, 1, pageSize, thisKey.day);
    searchInput.value = '';
};

// API 1
const creatList = (items) => {
    depList.innerHTML = items.map((item) => creatHtml(item)).join('');
    cateatCongestionData();
};
const updatePagination = (page, totalPage, pageSize, day) => {
    let pageGroup = Math.ceil(page / groupSize);
    let firstPage = (pageGroup - 1) * groupSize + 1;
    let lastPage = Math.min(totalPage, groupSize * pageGroup);
    let pagenationHtaml = `<button class="btn" onclick="pageData(dataList, ${page - 1}, ${pageSize}, ${day})" ${page === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button>`;
    for (let i = firstPage; i <= lastPage; i++) {
        pagenationHtaml += `
            <button class="btn ${i == page ? 'on' : ''}" onclick="pageData(dataList, ${i}, ${pageSize}, ${day})">${i}</button>
        `;
    }
    pagenationHtaml += `<button class="btn" onclick="pageData(dataList, ${page + 1}, ${pageSize}, ${day})" ${page === totalPage ? 'disabled' : ''}><i class="fa-solid fa-chevron-right"></i></button>`;
    pagenation.innerHTML = pagenationHtaml;
};

const sortDataTime = (data) => {
    data.sort((a, b) => {
        return Number(a.Master.scheduleDateTime) - Number(b.Master.scheduleDateTime);
    });
};

const filterAfterThistime = (data, day) => {
    day = day.toString();
    const dayData = day.padEnd(12, '0');
    const tomorrowData = formattedTomorrow.fullDate.padEnd(12, '9');
    sortDataTime(data);

    return data.filter((dateItem) => {
        const result = Number(dateItem.Master.scheduleDateTime) >= Number(dayData) && Number(dateItem.Master.scheduleDateTime) <= Number(tomorrowData);
        return result;
    });
};

const pageData = (data, page, pageSize, day) => {
    let filterKeyword = thisKey.keyword;
    if (thisKey.keyword) {
        filterKeyword = data.filter((item) => {
            const masterResult = item.Master.airport.includes(thisKey.keyword) || item.Master.airportCode.includes(thisKey.keyword) || item.Master.flightId.includes(thisKey.keyword);
            const slaveResult = item.Slaves.some((slave) => slave.flightId.includes(thisKey.keyword));
            return masterResult || slaveResult;
        });
    } else {
        filterKeyword = data;
    }

    let filteredData = filterAfterThistime(filterKeyword, thisKey.day);
    const totalResults = filteredData.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageItems = filteredData.slice(startIndex, endIndex);
    const totalPage = Math.ceil(totalResults / pageSize);
    if (filteredData.length === 0) {
        depList.innerHTML = `<li class="no_list">검색 결과가 없습니다 </li>`;
        pagenation.remove();
    } else {
        creatList(pageItems);
        updatePagination(page, totalPage, pageSize, day);
    }
};

const newDataList = (dataList) => {
    const masterMap = new Map();
    const results = [];
    dataList.forEach((item) => {
        if (item.codeshare === 'Master') {
            const masterArr = { Master: item, Slaves: [], SlaveIds: new Set() };
            if (masterMap.has(item.flightId)) {
                const masters = masterMap.get(item.flightId);
                masters.push(masterArr);
            } else {
                masterMap.set(item.flightId, [masterArr]);
            }
        } else if (item.codeshare === 'Slave' && item.masterflightid) {
            const masterEntries = masterMap.get(item.masterflightid);
            if (masterEntries) {
                masterEntries.forEach((masterArr) => {
                    // Slave 항목을 추가하기 전에 flightId 중복 검사
                    if (!masterArr.SlaveIds.has(item.flightId)) {
                        masterArr.Slaves.push(item);
                        masterArr.SlaveIds.add(item.flightId);
                    }
                });
            }
        }
    });
    masterMap.forEach((masterEntries) => {
        masterEntries.forEach((masterArr) => {
            const { slaveIds, ...resultEntry } = masterArr;
            results.push(resultEntry);
        });
    });
    return results;
};

// API 2 - 인천국제공항공사_승객예고 - 출입국별
const getLatesCongestionDatas = async () => {
    const baseURL = `http://apis.data.go.kr/B551177/PassengerNoticeKR/getfPassengerNoticeIKR?serviceKey=${API_KEY}&type=json`;
    const url1 = new URL(`${baseURL}&selectdate=0`);
    const url2 = new URL(`${baseURL}&selectdate=1`);
    const [response1, response2] = await Promise.all([fetch(url1), fetch(url2)]);
    const data1 = await response1.json();
    const data2 = await response2.json();
    densityData1 = data1.response.body.items;
    densityData2 = data2.response.body.items;
    densityData = densityData1.concat(densityData2);
    cateatCongestionData();
};

//join
const cateatCongestionData = () => {
    const rowItems = document.querySelectorAll('.depList .rowItem');
    rowItems.forEach((item) => {
        const adate = item.dataset.adate;
        const scTime = parseInt(item.dataset.sctime);
        const terminal = item.dataset.terminal;
        if (adate == formattedToday.fullDate) {
            const creatElm = document.createElement('div');
            creatElm.className = 'rowItemAco';
            creatElm.style.height = '0px';
            creatElm.innerHTML = creatRowItemsSiblingDiv(densityData1[scTime], terminal);
            item.parentNode.insertBefore(creatElm, item.nextSibling);
        } else if (adate == formattedTomorrow.fullDate) {
            const creatElm = document.createElement('div');
            creatElm.className = 'rowItemAco';
            creatElm.style.height = '0px';
            creatElm.innerHTML = creatRowItemsSiblingDiv(densityData2[scTime], terminal);
            item.parentNode.insertBefore(creatElm, item.nextSibling);
        }
        item.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const rowItemAco = target.nextElementSibling;
            if (rowItemAco.style.height !== '0px') {
                rowItemAco.style.height = '0px';
                target.parentElement.classList.remove('on');
            } else {
                rowItemAco.style.height = rowItemAco.scrollHeight + 'px';
                target.parentElement.classList.add('on');
            }
        });
    });
};
