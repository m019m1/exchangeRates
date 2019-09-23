const CURRENCIES = [
	['AUD', 'Australian dollar', 1],
	['BGN',	'Bulgarian lev', 1],
	['BRL',	'Brazilian real', 1],
	['CAD',	'Canadian dollar', 1],
	['CHF',	'Swiss franc', 1],
	['CNY',	'Chinese yuan renminbi', 10],
	['CZK',	'Czech koruna', 10],
	['DKK',	'Danish krone', 10],
	['EUR',	'European euro', 1],
	['GBP',	'Pound sterling', 1],
	['HKD',	'Hong Kong dollar', 10],
	['HRK',	'Croatian kuna', 10],
	['HUF',	'Hungarian forint', 100],
	['IDR',	'Indonesian rupiah', 10000],
	['ILS',	'Israeli shekel', 1],
	['INR',	'Indian rupee', 100],
	['ISK',	'Icelandic krona', 100],
	['JPY',	'Japanese yen', 100],
	['KRW',	'South Korean won', 1000],
	['MXN',	'Mexican peso', 10],
	['MYR',	'Malaysian ringgit', 1],
	['NOK',	'Norwegian krone', 10],
	['NZD',	'New Zealand dollar', 1],
	['PHP',	'Philippine peso', 100],
	['PLN',	'Polish zloty', 1],
	['RON',	'Romanian leu', 1],
	['RUB',	'Russian rouble', 100],
	['SEK',	'Swedish krona', 10],
	['SGD',	'Singapore dollar', 1],
	['THB',	'Thai baht', 10],
	['TRY',	'Turkish lira', 10],
	['USD',	'US dollar', 1],
	['ZAR',	'South African rand', 10]
];

const currencyFrom = document.getElementById('currencyFrom');
const currencyTo = document.getElementById('currencyTo');
const coinsFrom = document.getElementById('coinsFrom');
const coinsTo = document.getElementById('coinsTo');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
let today;

initDate();
initCurrencies();

function initDate() {
	today = new Date();
	let [year, month, day] = getYearMonthDay(today);
	startDate.value = `${year}-${month}-01`;
	today = endDate.value = `${year}-${month}-${day}`;
}

function initCurrencies() {
	let options = '';
	for(let [name, description] of CURRENCIES) {
		switch (name) {
			case 'USD':
				currencyFrom.innerHTML += `<option selected value=${name}> ${name} - ${description}</option>`;
				currencyTo.innerHTML += `<option value=${name}> ${name} - ${description}</option>`;
				showNominal(coinsFrom, currencyFrom.value);
				break;
			case 'RUB':
				currencyFrom.innerHTML += `<option value=${name}> ${name} - ${description}</option>`;
				currencyTo.innerHTML += `<option selected value=${name}> ${name} - ${description}</option>`;
				showNominal(coinsTo, currencyTo.value);
				break;
			default:
				currencyFrom.innerHTML += `<option value=${name}> ${name} - ${description}</option>`;
				currencyTo.innerHTML += `<option value=${name}> ${name} - ${description}</option>`;
		}
	}
}

currencyFrom.onchange = function() {showNominal(coinsFrom, event.currentTarget.value)};
currencyTo.onchange = function() {showNominal(coinsTo, event.currentTarget.value)};

function showNominal(scoreboard, name) {
	const index = ( CURRENCIES.map( currency => currency[0]) ).indexOf(name);
	if(index == -1) return;
	scoreboard.value = CURRENCIES[index][2];
}

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart( ctx, {
	type: 'line',
	data: {
		datasets: [{
			label: '',
			backgroundColor: 'transparent',
			borderColor: 'rgb(0, 186, 6)'
		}]
	},
	options: {
		title: {
			display: true,
			text: `Exchange rate's chart`,
			fontSize: 20,
			fontColor: '#000',
			lineHeight: 1
		},
		legend: {
			labels: {
				boxWidth: 0
			}
		},
		tooltips: {
			intersect: false,
			callbacks: {
				label: tooltipItem => (+tooltipItem.value).toFixed(2)
			}
		}
	}
});

const go = document.getElementById('go');
const backward = document.getElementById('backward');
const forward = document.getElementById('forward');
go.onclick = () => getRates(startDate.value, endDate.value);
forward.onclick = () => goForward(30);
backward.onclick = () => goBackward(30);

function goForward(numOfDays) {
	let start = new Date(startDate.value);
	let end = new Date(endDate.value);
	const deltaMonths = (end - start) / 1000 / 86400;

	end.setDate(end.getDate() + numOfDays);
	end = end > new Date() ? new Date() : end;
	let [year, month, day] = getYearMonthDay(end);
	endDate.value = `${year}-${month}-${day}`;
	
	if(deltaMonths >= 30) {
		start.setDate(start.getDate() + numOfDays);
		let [year2, month2, day2] = getYearMonthDay(start);
		startDate.value = `${year2}-${month2}-${day2}`;
	}
	getRates(startDate.value, endDate.value);
};

function goBackward(numOfDays) {
	let start = new Date(startDate.value);
	let end = new Date(endDate.value);
	const deltaMonths = (end - start) / 1000 / 86400;


	start.setDate(start.getDate() - numOfDays);
	let [year, month, day] = getYearMonthDay(start);
	startDate.value = `${year}-${month}-${day}`;

	if(deltaMonths >= 30) {
		end.setDate(end.getDate() - numOfDays);
		let [year2, month2, day2] = getYearMonthDay(end);
		endDate.value = `${year2}-${month2}-${day2}`;
	}
	getRates(startDate.value, endDate.value);
};

function getYearMonthDay(date) {
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	month = month > 9 ? month : '0' + month;
	let day = date.getDate(); 
	day = day > 9 ? day : '0' + day;
	return [year, month, day];
}
function getRates(start, end) {
	
	// checking
	if(!isNumeric(coinsFrom.value) || !isNumeric(coinsTo.value) ||
	coinsFrom.value == 0 || coinsTo.value == 0 ||
	start == "" || end === "" ||
	start > end ||
	start > today || end > today
	) {
		alert("Please, enter correct data");
		return false;
	}
	
	(async () => {
		const url = `https://api.exchangeratesapi.io/history?start_at=${start}&end_at=${end}&symbols=${currencyTo.value}&base=${currencyFrom.value}`;
		const response = await fetch(url);
		const result = await response.json();
		if(isEmpty(result.rates)) {
			document.getElementById('result').innerHTML = "Sorry, we haven't exchange rates for this period =(";
			myChart.data.labels = [];
			myChart.data.datasets[0].data = [];
			myChart.data.datasets[0].label = '';
			myChart.options.legend.labels.boxWidth = 0;
			
			myChart.update({
				duration: 1000
			});
			checkWhetherCanGoForward();
			return false;
		}
		
		// sorting results
		const cortedResult = Object.entries(result.rates).sort( ([key1], [key2]) => {
			return Date.parse(key1) - Date.parse(key2);
		});
		
		let dates = [], values = [];
		for(let [date, value] of cortedResult) {
			dates.push(date);
			values.push(value[currencyTo.value] * coinsFrom.value / coinsTo.value);
		}
		
		// to save animation it's need to override props of old object instead of creating new object
		myChart.data.labels = dates;
		myChart.data.datasets[0].data = values;
		myChart.data.datasets[0].label = `${coinsFrom.value} ${currencyFrom.value} to ${coinsTo.value} ${currencyTo.value} exchange rate`;
		myChart.options.legend.labels.boxWidth = 15;
		
		myChart.update({
			duration: 1000
		});
		
		const scoreboard = document.getElementById('result');
		scoreboard.innerHTML = `${coinsFrom.value} ${currencyFrom.value} 
		to ${coinsTo.value} ${currencyTo.value} rate on the end-date is 
		${values[values.length - 1].toFixed(4)}`;
		
		backward.style.display = forward.style.display = "inline-block";
		checkWhetherCanGoForward();

		function checkWhetherCanGoForward() {
			if(end == today) forward.setAttribute('disabled', 'true');
				else forward.removeAttribute('disabled');
		}
	})();
	
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
function isEmpty(obj) {
	for (let key in obj) {
		return false;
	}
	return true;
}
