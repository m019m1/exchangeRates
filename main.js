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

initDate();
initCurrencies();

function initDate() {
	let today = new Date();
	let year = today.getFullYear();
	let month = today.getMonth() + 1;
	month = month > 9 ? month : '0' + month;
	let day = today.getDate(); 
	day = day > 9 ? day : '0' + day;
	
	let datePickers = document.getElementsByClassName('datePicker');
	datePickers[0].value = `${year}-${month}-01`;
	datePickers[1].value = `${year}-${month}-${day}`;
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
				boxWidth: 15
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

function convert() {
	if(!isNumeric(coinsFrom.value) || !isNumeric(coinsTo.value) ||
		 coinsFrom.value == 0 || coinsTo.value == 0 ||
		 startDate.value == "" || endDate.value === "" ||
		 startDate.value > endDate.value
		 ) {
		alert("Please, enter correct data");
		return false;
	}
	
	(async () => {
		const url = `https://api.exchangeratesapi.io/history?start_at=${startDate.value}&end_at=${endDate.value}&symbols=${currencyTo.value}&base=${currencyFrom.value}`;
		const response = await fetch(url);
		const result = await response.json();
		if(isEmpty(result.rates)) {
			document.getElementById('result').innerHTML = "Sorry, we haven't exchange rates for this period =(";
			return false;
		}
		const sorted = Object.entries(result.rates).sort( ([key1, value1], [key2, value2]) => {
			const a2 = Date.parse(key1);
			const b2 = Date.parse(key2);
			return a2 - b2;
		});
		const rates = sorted.rates;
		/* const dates = Object.keys(result.rates);
		const values = Object.values(result.rates).map( values => values[`${currencyTo.value}`].toFixed(4)); */
		
		//.values and .keys methods return random arrays! =((
		let dates = [], values = [];
		for(let [date, value] of sorted) {
			dates.push(date);
			values.push(value[currencyTo.value] * coinsFrom.value / coinsTo.value);
		}

		myChart.data.labels = dates;
		myChart.data.datasets[0] = {
			label: `${coinsFrom.value} ${currencyFrom.value} to ${coinsTo.value} ${currencyTo.value} exchange rate`,
			data: values,
			backgroundColor: 'transparent',
			borderColor: 'rgb(0, 186, 6)'
		};

		myChart.update({
			duration: 2000
		});

		const scoreboard = document.getElementById('result');
		scoreboard.innerHTML = `${coinsFrom.value} ${currencyFrom.value} 
												 to ${coinsTo.value} ${currencyTo.value} current rate is 
												 		${values[values.length - 1].toFixed(4)}`;
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