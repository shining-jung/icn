## 인천공항 출입국 예상 혼잡도

> 개발 기간 : 24.04.18 ~ 24.04.23

인천공항의 각 출국장별로 예상 혼잡도를 추측해 주는 서비스를 제공합니다.

다음 날의 예상 값까지 제공하며, 예상 대기 인원을 확인하고 어떤 출국장으로 갈지, 언제 출발하면 좋을지 미리 결정수 있습니다.

## 주요기능

-   오늘 날짜, 현재시간부터 내일 날짜의 운항 스케쥴 리스트 데이터 제공
-   날짜, 시간으로 소팅 (단 오늘날짜는 현재시간을 Selected)
-   목적지, 편명 검색
-   항목 별 터미널 출/입국장 별 예상혼잡도 데이터 제공

## 개발 이슈 및 처리방법

#### 요청쿼리의 부재

-   제공되는 공공APi가 요청Key와 Type(xml, json)정도의 단순한 구조의 요청쿼리만 존재함
-   API를 최초 한번만 로드하여 배열에 재가공하여 다른 기능함수들이 작동할수 있도록 구현

#### 개발 진행 중 편명과 항공사만 다르고 비슷하게 보이는 DataList들을 발견 (코드쉐어)

-   API호출 후 배열을 1개의 Object 안에 Matser, Slave의 배열로 재할당하여 개발로직 수정

## API 목록

<details>
    <summary> # 인천국제공항공사\_여객편 주간 운항 현황 </summary>
    **요청**

</details>
<details>
    <summary> # 인천국제공항공사 승객예고 - 출입국별 </summary>
    
   
</details>