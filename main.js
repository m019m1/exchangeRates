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

let currencyPickerFrom = document.getElementById('currencyPickerFrom');
let currencyPickerTo = document.getElementById('currencyPickerTo');
let coinsFrom = document.getElementById('coinsFrom');
let coinsTo = document.getElementById('coinsTo');

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
		options += `<option value=${name}> ${name} - ${description}</option>`;
	}
	currencyPickerFrom.innerHTML += options;
	currencyPickerTo.innerHTML += options;
}

currencyPickerFrom.oninput = function() {showNominal(coinsFrom, event.currentTarget.value)};
currencyPickerTo.oninput = function() {showNominal(coinsTo, event.currentTarget.value)};

function showNominal(scoreboard, name) {
	const index = ( CURRENCIES.map( currency => currency[0]) ).indexOf(name);
	if(index == -1) return;
	scoreboard.value = CURRENCIES[index][2];
}

let ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart( ctx, {
 	type: 'line',
	data: {
			datasets: []
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
	const curNameFrom = document.getElementById('currencyPickerFrom').value;
	const curNameTo = document.getElementById('currencyPickerTo').value;
	const dateFrom = document.getElementById('datePicker1').value;
	const dateTo = document.getElementById('datePicker2').value;

	if(!curNameFrom || !curNameTo) return false;
	
	(async () => {
		const url = `https://api.exchangeratesapi.io/history?start_at=${dateFrom}&end_at=${dateTo}&symbols=${curNameTo}&base=${curNameFrom}`;
		const response = await fetch(url);
		const result = await response.json();
		const sorted = Object.entries(result.rates).sort( ([key1, value1], [key2, value2]) => {
			const a2 = Date.parse(key1);
			const b2 = Date.parse(key2);
			return a2 - b2;
		});
		const rates = sorted.rates;
		/* const dates = Object.keys(result.rates);
		const values = Object.values(result.rates).map( values => values[`${curNameTo}`].toFixed(4)); */
		
		//.values and .keys methods return random arrays! =((
		let dates = [], values = [];
		for(let [date, value] of sorted) {
			dates.push(date);
			values.push(value[curNameTo] * coinsFrom.value / coinsTo.value);
		}

		myChart.data.labels = dates;
		myChart.data.datasets[0] = {
			label: `${coinsFrom.value} ${curNameFrom} to ${coinsTo.value} ${curNameTo} exchange rate`,
			data: values,
			backgroundColor: 'transparent',
			borderColor: 'rgb(0, 186, 6)'
		};

		myChart.update({
			duration: 2000
		});

		const scoreboard = document.getElementById('result');
		scoreboard.innerHTML = `${coinsFrom.value} ${curNameFrom} 
												 to ${coinsTo.value} ${curNameTo} current rate is 
												 		${values[values.length - 1].toFixed(4)}`;
	})();

}

