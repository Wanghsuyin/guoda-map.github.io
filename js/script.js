let peopleData = [];
let map;

// -------- 初始化地圖 --------
function initMap(){
    map = L.map('map').setView([25, 121], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution:'&copy; OpenStreetMap contributors'
    }).addTo(map);

    peopleData.forEach(p=>{
        if(p.lat && p.lon){
            let photo_html = p.photo ? `<img src="${p.photo}" width="80"><br>` : '';
            let popup = `${photo_html}<b>${p.name}</b><br>年齡:${p.age}<br>性別:${p.gender}<br>單位:${p.unit}`;
            L.circleMarker([p.lat,p.lon],{
                radius:5, color:'blue', fillColor:'blue', fillOpacity:0.7
            }).addTo(map).bindPopup(popup);
        }
    });
}

// -------- 統計圖表 --------
function initCharts(){
    let gender_count = {"男":0,"女":0,"其他":0};
    let province_count = {};
    let ages = [];

    peopleData.forEach(p=>{
        gender_count[p.gender] = (gender_count[p.gender]||0)+1;
        let prov = p.unit.slice(0,2);
        province_count[prov] = (province_count[prov]||0)+1;
        if(typeof p.age==='number') ages.push(p.age);
    });

    // Chart.js 男女比例
    new Chart(document.getElementById('genderChart'),{
        type:'pie',
        data:{
            labels:['男','女','其他'],
            datasets:[{data:[gender_count['男'],gender_count['女'],gender_count['其他']], backgroundColor:['#36A2EB','#FF6384','#FFCE56']}]
        }
    });

    // Chart.js 省份比例
    new Chart(document.getElementById('provinceChart'),{
        type:'pie',
        data:{
            labels:Object.keys(province_count),
            datasets:[{data:Object.values(province_count), backgroundColor:['#FF6384','#36A2EB','#FFCE56','#AA66CC','#99CC00','#FF9900']}]
        }
    });

    // Chart.js 年齡分布
    let ageLabels=[];
    for(let i=0;i<=100;i+=5) ageLabels.push(i+'-'+(i+4));
    let ageCounts = new Array(ageLabels.length).fill(0);
    ages.forEach(a=>{
        let idx=Math.floor(a/5);
        if(idx>=ageCounts.length) idx=ageCounts.length-1;
        ageCounts[idx]++;
    });
    new Chart(document.getElementById('ageChart'),{
        type:'bar',
        data:{
            labels:ageLabels,
            datasets:[{label:'人數', data:ageCounts, backgroundColor:'#36A2EB'}]
        }
    });

    // 特殊案例
    let sorted = peopleData.filter(p=>typeof p.age==='number').sort((a,b)=>b.age-a.age);
    document.getElementById('oldest-person').innerText=`最年長：${sorted[0].name} (${sorted[0].age}歲)`;
    document.getElementById('youngest-person').innerText=`最年輕：${sorted[sorted.length-1].name} (${sorted[sorted.length-1].age}歲)`;
}

// -------- DataTables --------
function initTable(){
    $('#peopleTable').DataTable({
        data: peopleData,
        columns:[
            {title:'名字', data:'name'},
            {title:'性別', data:'gender'},
            {title:'年齡', data:'age'},
            {title:'籍貫', data:'birthplace'},
            {title:'單位', data:'unit'},
            {title:'學歷', data:'education', render: d=>d.join(', ')},
            {title:'經歷', data:'experience', render: d=>d.join(', ')},
            {title:'照片', data:'photo', render: d=>d?`<img src="${d}" width="50">`:'無'}
        ]
    });
}

// -------- 載入 JSON --------
fetch("data/people_data.json")
.then(res=>res.json())
.then(data=>{
    peopleData = data;
    initMap();
    initCharts();
    initTable();
});
