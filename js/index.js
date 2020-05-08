let PARAMETERS = {
    DATA : [],
    COUNTRIES : [],
    MAP_VIEWS: {TOTAL_CASES: "total-cases", POPULATION: "population", TOTAL_DEATHS: "total-deaths", INFECTION_RATES: "infection-rates",
        MORTALITY_RATES: "mortality-rates", NEW_CASES: "new-cases", NEW_DEATH: "new-deaths"},
    SELECTED_MAP_VIEW : "total-cases"
};

$(document).ready(function(){
    (async () => {
        const data = await d3.csv('js/country-info.csv');
        readCountries(data);
    })();

    $("#world-map-selector").change(function(){
        let selection = $(this).children("option:selected").val();
        PARAMETERS.SELECTED_MAP_VIEW = selection;
        $("#world-map-selected-text").html(selection.replace("-"," ").toUpperCase());
        reDrawWorldMap(selection);
    });
});

function readCountries(data){
    data.forEach((countryInfo) => {
        PARAMETERS.COUNTRIES.push({countryName: countryInfo.country_name, population: parseInt(countryInfo.population), countryCode: countryInfo.country_code,
            countryCodeThree: countryInfo.country_code_three, countryCapital: countryInfo.capital});
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
                country.recentDate = formatDate(countryCovidData.date);
                let infectionRate = (parseFloat(countryCovidData.total_cases)/parseFloat(country.population))*100;
                country.infectionRate = parseFloat(infectionRate.toLocaleString());
                let mortalityRate = (parseFloat(countryCovidData.total_deaths)/parseFloat(countryCovidData.total_cases))*100;
                country.mortalityRate = parseFloat(mortalityRate.toLocaleString());
                country.newCases = parseInt(countryCovidData.new_cases);
                country.newDeaths = parseInt(countryCovidData.new_deaths);
            }
        });
    });
    showMap();
}

function showMap(){
    let mapCoronaCases = {};
    PARAMETERS.COUNTRIES.forEach((country) => {
        mapCoronaCases[country.countryCode] = country.totalCases;
    });
    drawWorldMap(mapCoronaCases);
}

function reDrawWorldMap(selection){
    let mapPopulations = {};
    let mapCoronaCases = {};
    let mapCoronaDeaths = {};
    let mapCoronaInfectionRates = {};
    let mapCoronaDeathRates = {};
    let mapCoronaNewCases = {};
    let mapCoronaNewDeaths = {};
    PARAMETERS.COUNTRIES.forEach((country) => {
        mapPopulations[country.countryCode] = country.population;
        mapCoronaCases[country.countryCode] = country.totalCases == null || isNaN(country.totalCases) == null || country.totalCases == undefined ? 0 : country.totalCases;
        mapCoronaDeaths[country.countryCode] = country.totalDeaths == null || isNaN(country.totalDeaths) == null || country.totalDeaths == undefined ? 0 : country.totalDeaths;
        mapCoronaInfectionRates[country.countryCode] = country.infectionRate == null || isNaN(country.infectionRate) || country.infectionRate == undefined ? 0 : country.infectionRate;
        mapCoronaDeathRates[country.countryCode] = country.mortalityRate == null || isNaN(country.mortalityRate) || country.mortalityRate == undefined ? 0 : country.mortalityRate;
        mapCoronaNewCases[country.countryCode] = country.newCases == null || isNaN(country.newCases) || country.newCases == undefined ? 0 : country.newCases;
        mapCoronaNewDeaths[country.countryCode] = country.newDeaths == null || isNaN(country.newDeaths) || country.newDeaths == undefined ? 0 : country.newDeaths;
    });
    if(selection == "total-cases"){
        drawWorldMap(mapCoronaCases);
    }
    else if(selection == "population"){
        drawWorldMap(mapPopulations);
    }
    else if(selection == "total-deaths"){
        drawWorldMap(mapCoronaDeaths);
    }
    else if(selection == "infection-rates"){
        drawWorldMap(mapCoronaInfectionRates);
    }
    else if(selection == "mortality-rates"){
        drawWorldMap(mapCoronaDeathRates);
    }
    else if(selection == "new-cases"){
        drawWorldMap(mapCoronaNewCases);
    }
    else if(selection == "new-deaths"){
        drawWorldMap(mapCoronaNewDeaths);
    }
}

function drawWorldMap(data){
    $("#world-map").html("");
    $('#world-map').vectorMap({
        map: 'world_mill',
        series:{
            regions: [{
                values: data,
                scale: ['#0db51b', '#b41407'],
                normalizeFunction: 'polynomial',
                legend: {
                    vertical: true,
                }
            }]
        },
        onRegionTipShow: function(e, el, code){
            el.html(el.html().toUpperCase()+ "<br> Capital - "+getCountryObject(code).countryCapital +
                "<br>Population - " + getCountryObject(code).population.toLocaleString() +
                "<br> Total Cases - "+getCountryObject(code).totalCases.toLocaleString() +
                "<br> Total Deaths - "+ getCountryObject(code).totalDeaths.toLocaleString() +
                "<br> Date - "+ getCountryObject(code).recentDate.toLocaleString() +
                "<br> Infection Rate - "+ getCountryObject(code).infectionRate.toLocaleString()+"%"+
                "<br> Mortality Rate - "+ getCountryObject(code).mortalityRate.toLocaleString()+"%"+
                "<br> New Cases - "+ getCountryObject(code).newCases.toLocaleString()+
                "<br> New Deaths - "+ getCountryObject(code).newDeaths.toLocaleString());
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

function formatDate(dateString){
    if(dateString == null || dateString == "" || dateString == undefined){
        return "";
    }
    let year = dateString.split("-")[0];
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let month = months[parseInt(dateString.split("-")[1]) - 1];
    let day = parseInt(dateString.split("-")[2]);
    return month+" "+day+", "+year;
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