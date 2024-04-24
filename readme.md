# 인천공항 출입국 예상 혼잡도

<img src="./common/img/readme.jpg" alt="인천공항 출입국 예상 혼잡도">

> 진행기간 : 24.04.18 ~ 24.04.22

인천공항의 각 출국장별로 예상 혼잡도를 추측해 주는 서비스를 제공합니다.

내일까지의 운항스케쥴 데이터를 제공하며, 항공편 별 예상 대기 인원을 확인하고 어떤 입/출국장으로 갈지, 언제 출발하면 좋을지 미리 결정수 있습니다.
<br><br>

## 주요기능

-   오늘, 내일의 운항 스케쥴 제공 (오늘날짜는 현재시간을 이후 항공편들을 디폴트로 제공합니다.)
-   날짜, 시간으로 소팅 및 목적지, 편명 검색 기능
-   항공편 정보 및 해당 터미널 출/입국장 예상혼잡도 안내
    <br><br>

## 이슈 및 처리방법

#### 1. 요청쿼리의 부재

-   제공되는 공공APi가 요청Key와 Type(xml, json)정도의 단순한 구조의 요청쿼리만 존재함
-   API를 최초 한번만 로드하여 배열에 재가공하여 다른 기능함수들이 작동할수 있도록 구현.

#### 2. 진행 중 편명과 항공사만 다르고 비슷하게 보이는 리스트들을 발견 (코드쉐어)

-   API호출 후 배열을 Object 안에 Matser, Slave의 배열로 재할당하여 개발로직 수정
    <br><br>


## API 목록

#### 인천국제공항공사\_여객편 주간 운항 현황

[https://www.data.go.kr/data/15095074/openapi.do](https://www.data.go.kr/data/15095074/openapi.do)

인천공항 여객 항공기 출발 / 도착 정보 현황에 대한 데이터로 조회일 기준 +6일간의 항공사/항공 편명, 터미널 구분, 도착/출발 시간, 출발/도착지 정보 등을 제공합니다.

#### 인천국제공항공사\_승객예고 - 출입국별(국문)

[https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15095066](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15095066)

인천공항의 출국승객 예상 혼잡정보에 대한 데이터로 오늘, 내일의 제 1,2여객터미널의 입국심사 , 입국장, 출국장 현황 정보를 제공합니다.
  <br><br>

---
  
## 작업진행 -- 나중에 수정해서 재정리 
제가 선택한 API는 요청쿼리는 요청쿼리가 거의 없는 API이기 떄문에 API를 로드 후 슬라이스하여 화면에 부려주는 로직으로 방향을 잡았습니다.
개발도중 코드쉐어 항공편이 여러개 노출되는 현상을 발견하였고, 로드 후 json 배열을 Master와 Slave로 재할당하는 로직을 나중에 추가했습니다.
<br><br>
### 1.주간스케쥴 Json 데이터 구조화
1. json 호출 이후 배열을 재할당하는 함수를 실행합니다.<br>
2. 호출된 데이터를 순환하여(반복문), 객체 중 코드쉐어(codeshare)를 키로 Master{}, Slave[], SlaveIds{}로 재할당합니다.<br>

##### [재배열 상세설명]
1.  Master : 새로운 객체를 생성하고 Map에 저장합니다. (Master는 flightId중복가능 - 매일 운항편이 있기때문에...)<br>
2.  Slave : masterflightid(코스쉐어 마스터의 편명)값을 키로 Master의 flightId와 일치하는 항목을 찾아 Slave 중복방지를 하고 Slave배열에 할당합니다.<br>
3.  Slave 중복검사 - 1번의 재할당된 배열을 반복문으로 검사해서 Slave의 flightId가 SlaveIds에 없는경우에만 배열에 추가 하고 SlaveIds 에도 추가합니다.<br>


기존 json 데이터 구조 (예시)

```javascript
"items": [
                {
                    "airline": "필리핀에어아시아",
                    "flightId": "Z2889",
                    "scheduleDateTime": "202404170005",
                    "estimatedDateTime": "202404162347",
                    "airport": "마닐라",
                    "chkinrange": "K23-K26",
                    "gatenumber": "113",
                    "codeshare": "Master",
                    "masterflightid": "",
                    "remark": "출발",
                    "airportCode": "MNL",
                    "terminalid": "P02"
                },
		]
```

변경 후 데이터 구조 (예시)

```javascript
[
	Master {
			    "airline": "필리핀에어아시아",
			    "flightId": "Z2889",
			    "scheduleDateTime": "202404170005",
			    "estimatedDateTime": "202404162347",
			    "airport": "마닐라",
			    "chkinrange": "K23-K26",
			    "gatenumber": "113",
			    "codeshare": "Master",
			    "masterflightid": "",
			    "remark": "출발",
			    "airportCode": "MNL",
			    "terminalid": "P02"
			},
	SlaveIds {'Z2889', 'Z2887', 'Z2889'},
	Slave [
		 {  "airline": "무슨아시아" "flightId": "Z2889", .....},
		 {  "airline": "어쩌구항공 "flightId": "Z2889", .....},
		 {  "airline": "기타항공" "flightId": "Z2889", .....}
	]
]
```
<br><br>
### 2.페이지생성
검색, 소팅, Pagenation 기능등을 위해 변경되는 변수명을 전역변수에서 let으로 선언 후 재사용합니다<br>
(dataList (호출한 json데이터들을 재배열한 데이터들) , thisKey, pageSize, page, groupSize 등등 )

여기서 만든 pageData()함수는 정보들이 변경되었을때 값을 받아와서 처리하고, 리스트업을 하는 코어 역활을 합니다.
```javascript
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
    creatList(pageItems);
    updatePagination(page, totalPage, pageSize, day);
};
---
```
1. 검색, 소팅, liast정렬을 위한 함수를 실행합니다.[filter()를 활용 하여 데이터를 처리 함.]<br>
2. slice()를 이용하여 원하는만큼의 page만 생성 후 html의 리스트를 만드는 함수 실행합니다.<br>
3. pagenation을 만드는 함수를 실행합니다.<br>
<br><br>
### 3.입/출국장 승객예고 API 호출
이 API는 1일치 데이터만 호출하기떄문에 2번 불러야 합니다. (오늘, 내일데이터)<br>
전단계에서 아이템들을 리스트업을 했다면, 이 API 아이템들을 dataset을 이요하여 리스트 아이템에 배당합니다. 

<br>

1. json호출 후 함수로 가공 <br>
2. 가공하는 함수 설명 (cateatCongestionData()) --> <br>
   2번(pageData)함수에서 이미 만들어진 list 인 li의 직계자손 div.rowItem을 선택자로 <br>
   선택자의 dataset을 키값으로 형제관계의 div를 만들어 html을 생성하는 함수을 실행하여 배치합니다.<br>
   <br>
3. 그리고 2번(pageData)함수에서 이미 만들어진.rowItem을 선택자를 클릭했을때 <br>
   slide 토글시키는 이벤트리스너를 실행합니다. common.js - 204 line (따로 이벤트리스너를 빼고싶었으나 -...이게 심히 거슬림 .. , json등 비동기 처리때문인지 모르겠지만 따로 빼면 실행이 안되어서 이 위치에선 에러가 안나길래 냅뒀음...얻어걸린거라 강사님께 물어봐야함) <br>
<br><br>
### 4.추가기능 함수들 작업
변경되는 값들이 있을때 전역변수를 재할당 하거나 2번(pageData())함수로 바로 보내서 가공하는 형태의 구조로 기능별로 구현했습니다.

1. creatTimeStVal(), getDayKr() --> Html 구조문에서 Selct박스 option값을 생성하는 함수 -> 이벤트리스너로 값들이 변경될때 2번(pageData)함수로 보내고 실행 <br>
2. searchFn() -->검색어를 전역변수 thisKey로 재할당 후 2번(pageData)함수 실행 <br>
