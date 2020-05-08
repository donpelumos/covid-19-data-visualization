let PARAMETERS = {
    DATA : [],
    POPULATIONS : {AF:"458","AL":"595","DZ":"2197","AD":"521","AO":"11","AI":"3","AG":"16","AR":"1524","AM":"1135","AW":"89","AU":"6040","AT":"13639","AZ":"1536","BS":"26","BH":"1860","BD":"1403","BB":"47","BY":"4388","BE":"12731","BZ":"16","BJ":"50","BM":"59","BT":"5","BO":"198","BA":"928","BW":"8","BR":"51370","":"6","BG":"384","BF":"555","BI":"7","KH":"120","CM":"1000","CA":"28171","KY":"30","TD":"43","CL":"11189","CN":"78722","CO":"2148","KM":"0","CG":"30","CD":"103","CR":"428","HR":"1601","CU":"1001","CY":"296","CZ":"4214","DK":"7678","DJ":"755","DM":"14","DO":"1960","EC":"3433","EG":"1815","SV":"245","GQ":"13","ER":"30","EE":"264","ET":"93","FJ":"14","FI":"3500","FR":"53972","GF":"112","GA":"99","GM":"9","GE":"275","DE":"139900","GH":"303","GI":"136","GR":"1374","GL":"11","GD":"13","GP":"104","GT":"86","GN":"597","GW":"24","GY":"27","HT":"10","HN":"132","HK":"932","HU":"801","IS":"1750","IN":"15331","ID":"2317","IR":"81587","IQ":"1602","IE":"17110","IM":"271","IL":"10637","IT":"93245","CI":"721","JM":"57","JP":"4496","JO":"377","KZ":"1408","KE":"190","XK":"490","KW":"2219","KG":"637","LV":"464","LB":"206","LR":"75","LY":"24","LI":"55","LT":"718","LU":"3452","MG":"101","MW":"9","MY":"4702","MV":"20","ML":"261","MT":"407","MQ":"83","MR":"6","MU":"320","YT":"352","MX":"17781","MD":"1658","MC":"82","MN":"13","ME":"261","MS":"7","MA":"2017","MZ":"21","MM":"50","NA":"8","NP":"22","NL":"89","NC":"18","NZ":"1332","NI":"7","NE":"561","NG":"534","MK":"1057","NO":"32","OM":"888","PK":"6464","PA":"859","PG":"8","PY":"142","PE":"17527","PH":"1506","PL":"4862","PT":"2076","QA":"2070","RE":"300","RO":"5788","RU":"21327","RW":"130","LC":"15","MF":"29","SM":"97","SA":"6783","SN":"493","RS":"1971","SC":"8","SL":"54","SG":"1634","SK":"762","SI":"246","SO":"87","ZA":"3153","KR":"9419","ES":"159359","LK":"215","SD":"80","SR":"9","SE":"4074","CH":"25700","SY":"27","TW":"347","TJ":"0","TZ":"167","TH":"2772","TL":"20","TG":"77","TT":"103","TN":"591","TR":"78202","UG":"55","UA":"2396","AE":"3359","GB":"872","US":"213109","UY":"486","UZ":"1577","VE":"176","VN":"232","EH":"5","YE":"1","ZM":"101","ZW":"5"},
    COUNTRIES : []
};

$(document).ready(function(){
    (async () => {
        const data = await d3.csv('js/country-info.csv');
        readCountries(data);
    })();

    
});

function readCountries(data){
    data.forEach((countryInfo) => {
        PARAMETERS.COUNTRIES.push({countryName: countryInfo.country_name, population: parseInt(countryInfo.population),
            countryCode: countryInfo.country_code, countryCodeThree: countryInfo.country_code_three});
    });
    (async () => {
        const data = await d3.csv('js/covid-data.csv');
        readDataFile(data);
    })();
}

function readDataFile(data) {
    PARAMETERS.DATA = data;
    PARAMETERS.COUNTRIES.forEach((country) => {
        PARAMETERS.DATA.forEach((countryCovidData) => {
            if(country.countryCodeThree == countryCovidData.iso_code){
                country.totalCases = parseInt(countryCovidData.total_cases);
                country.totalDeaths = parseInt(countryCovidData.total_deaths);
            }
        });
    });
    showMap();
}

function showMap(){
    let mapPopulations = {};
    PARAMETERS.COUNTRIES.forEach((country) => {
        mapPopulations[country.countryCode] = country.population;
    });
    $('#world-map').vectorMap({
        map: 'world_mill',
        series:{
            regions: [{
                values: mapPopulations,
                scale: ['#9b0908', '#37b40e'],
                normalizeFunction: 'polynomial',
                legend: {
                    vertical: true,
                }
            }]
        },
        onRegionTipShow: function(e, el, code){
            el.html(el.html()+ "<br>Population - " + mapPopulations[code].toLocaleString() +
                "<br> Total Cases - "+getCountryObject(code).totalCases.toLocaleString() +
            "<br> Total Deaths - "+ getCountryObject(code).totalDeaths.toLocaleString());
        }
    });
}

function getCountryObject(countryCode){
    let countryObject = {};
    PARAMETERS.COUNTRIES.forEach((country) => {
        if(country.countryCode == countryCode){
            countryObject = country;
        }
    });
    return countryObject;
}


const drawHorizontalBarChart = ({ data, selector, option , colour}) => {
    $(selector).html("");

    const barHeight = 25;
    const margin = { top: 80, right: 0, bottom: 20, left: 70 },
        width = $(selector).width() - margin.left - margin.right,
        height = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;

    const svg = d3.select(selector).attr('viewBox', [0, 0, width, height]);

    const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .range([margin.left, width - margin.right]);
    const y = d3
        .scaleBand()
        .domain(d3.range(data.length))
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1);

    const xAxis = (g) =>
        g
            .attr('transform', `translate(0,${margin.top})`)
            .call(d3.axisTop(x).ticks(width / 80, option.format))
            .call((g) => g.select('.domain').remove())
            .call((g) =>
                g
                    .select('.tick:first-of-type text')
                    .clone()
                    .attr('x', 0)
                    .attr('y', -30)
                    .attr('text-anchor', 'start')
                    .attr('font-weight', 'bold')
                    .attr('fill', 'currentColor')
                    .text(option.yLabel)
            );
    const yAxis = (g) =>
        g
            .attr('transform', `translate(${margin.left},0)`)
            .call(
                d3
                    .axisLeft(y)
                    .tickFormat((i) => data[i].label)
                    .tickSizeOuter(0)
            )
            .call((g) => g.selectAll('text').attr('transform', 'rotate(10)'));

    const format = x.tickFormat(20, option.format);

    svg
        .append('g')
        .attr('fill', colour)
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', x(0))
        .attr('y', (d, i) => y(i))
        .attr('width', (d) => x(d.value) - x(0))
        .attr('height', y.bandwidth());
    svg
        .append('g')
        .attr('fill', 'white')
        .attr('text-anchor', 'end')
        .attr('font-family', 'sans-serif')
        .selectAll('text')
        .data(data)
        .join('text')
        .attr('x', (d) => x(d.value) - 4)
        .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .text((d) => format(d.value));
    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);
    svg
        .append('text')
        .attr('class', 'title')
        .attr('x', width / 2)
        .attr('y', margin.top / 3)
        .attr('text-anchor', 'middle')
        .text(option.title);
};

const drawHorizontalBarChartMoney = ({ data, selector, option , colour}) => {
    $(selector).html("");

    const barHeight = 25;
    const margin = { top: 80, right: 0, bottom: 20, left: 70 },
        width = $(selector).width() - margin.left - margin.right,
        height = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;

    const svg = d3.select(selector).attr('viewBox', [0, 0, width, height]);

    const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .range([margin.left, width - margin.right]);
    const y = d3
        .scaleBand()
        .domain(d3.range(data.length))
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1);

    const xAxis = (g) =>
        g
            .attr('transform', `translate(0,${margin.top})`)
            .call(d3.axisTop(x).ticks(width / 80, option.format))
            .call((g) => g.select('.domain').remove())
            .call((g) =>
                g
                    .select('.tick:first-of-type text')
                    .clone()
                    .attr('x', 0)
                    .attr('y', -30)
                    .attr('text-anchor', 'start')
                    .attr('font-weight', 'bold')
                    .attr('fill', 'currentColor')
                    .text(option.yLabel)
            );
    const yAxis = (g) =>
        g
            .attr('transform', `translate(${margin.left},0)`)
            .call(
                d3
                    .axisLeft(y)
                    .tickFormat((i) => data[i].label)
                    .tickSizeOuter(0)
            )
            .call((g) => g.selectAll('text').attr('transform', 'rotate(10)'));

    const format = x.tickFormat(20, option.format);
    let currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
    });

    svg
        .append('g')
        .attr('fill', colour)
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', x(0))
        .attr('y', (d, i) => y(i))
        .attr('width', (d) => x(d.value) - x(0))
        .attr('height', y.bandwidth());
    svg
        .append('g')
        .attr('fill', 'white')
        .attr('text-anchor', 'end')
        .attr('font-family', 'sans-serif')
        .selectAll('text')
        .data(data)
        .join('text')
        .attr('x', (d) => x(d.value) - 4)
        .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .text((d) => currencyFormatter.format(format(d.value)));
    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);
    svg
        .append('text')
        .attr('class', 'title')
        .attr('x', width / 2)
        .attr('y', margin.top / 3)
        .attr('text-anchor', 'middle')
        .text(option.title);
};

const drawDonutChart = ({ data, selector }) => {
    $(selector).html("");

    const margin = { top: 80, right: 20, bottom: 20, left: 80 },
        width = $(selector).width() - margin.left - margin.right,
        height = Math.min(width, 400);

    const svg = d3.select(selector).attr('viewBox', [-width / 2, -height / 2, width, height]);

    const pie = d3
        .pie()
        .padAngle(0.005)
        .sort(null)
        .value((d) => d.value);
    const radius = Math.min(width, height) / 2;
    const arc = d3
        .arc()
        .innerRadius(radius * 0.45)
        .outerRadius(radius - 1);
    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.label))
        .range(d3.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
    const arcs = pie(data);

    svg
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', (d) => color(d.data.label))
        .attr('d', arc)
        .append('title')
        .text((d) => `${d.data.label}: ${d.data.value.toLocaleString()}`);

    svg
        .append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 17)
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(arcs)
        .join('text')
        .attr('transform', (d) => `translate(${arc.centroid(d)})`)
        .call((text) =>
            text
                .append('tspan')
                .attr('y', '-0.4em')
                .attr('font-weight', 'bold')
                .text((d) => d.data.label)
        )
        .call((text) =>
            text
                .filter((d) => d.endAngle - d.startAngle > 0.25)
                .append('tspan')
                .attr('x', 0)
                .attr('y', '0.7em')
                .attr('fill-opacity', 0.7)
                .text((d) => d.data.value.toLocaleString())
        );
};

const drawDonutChartMoney = ({ data, selector }) => {
    $(selector).html("");

    const margin = { top: 80, right: 20, bottom: 20, left: 80 },
        width = $(selector).width() - margin.left - margin.right,
        height = Math.min(width, 400);

    const svg = d3.select(selector).attr('viewBox', [-width / 2, -height / 2, width, height]);

    const pie = d3
        .pie()
        .padAngle(0.005)
        .sort(null)
        .value((d) => d.value);
    const radius = Math.min(width, height) / 2;
    const arc = d3
        .arc()
        .innerRadius(radius * 0.45)
        .outerRadius(radius - 1);
    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.label))
        .range(d3.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
    const arcs = pie(data);
    let currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
    });

    svg
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', (d) => color(d.data.label))
        .attr('d', arc)
        .append('title')
        .text((d) => `${d.data.label}: ${d.data.value.toLocaleString()}`);

    svg
        .append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 15)
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(arcs)
        .join('text')
        .attr('transform', (d) => `translate(${arc.centroid(d)})`)
        .call((text) =>
            text
                .append('tspan')
                .attr('y', '-0.4em')
                .attr('font-weight', 'bold')
                .attr('fill-opacity', 0.9)
                .text((d) => "Q"+d.data.label)
        )
        .call((text) =>
            text
                .filter((d) => d.endAngle - d.startAngle > 0.25)
                .append('tspan')
                .attr('x', 0)
                .attr('y', '0.7em')
                .attr('fill-opacity', 0.9)
                .text((d) => currencyFormatter.format(d.data.value))
        );
};