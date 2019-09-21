const CURRENCIES = {
	AUD:	'Australian dollar',
	BGN:	'Bulgarian lev',
	BRL:	'Brazilian real',
	CAD:	'Canadian dollar',
	CHF:	'Swiss franc',
	CNY:	'Chinese yuan renminbi',
	CZK:	'Czech koruna',
	DKK:	'Danish krone',
	EUR:	'European euro',
	GBP:	'Pound sterling',
	HKD:	'Hong Kong dollar',
	HRK:	'Croatian kuna',
	HUF:	'Hungarian forint',
	IDR:	'Indonesian rupiah',
	ILS:	'Israeli shekel',
	INR:	'Indian rupee',
	ISK:	'Icelandic krona',
	JPY:	'Japanese yen',
	KRW:	'South Korean won',
	MXN:	'Mexican peso',
	MYR:	'Malaysian ringgit',
	NOK:	'Norwegian krone',
	NZD:	'New Zealand dollar',
	PHP:	'Philippine peso',
	PLN:	'Polish zloty',
	RON:	'Romanian leu',
	RUB:	'Russian rouble',
	SEK:	'Swedish krona',
	SGD:	'Singapore dollar',
	THB:	'Thai baht',
	TRY:	'Turkish lira',
	USD:	'US dollar',
	ZAR:	'South African rand'
};

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
	for(let datePicker of datePickers) {
		datePicker.value = `${year}-${month}-${day}`;
	}
}

function initCurrencies() {
	let options = '';
	for(let key in CURRENCIES) {
		options += `<option value=${key}>${CURRENCIES[key]}</option>`;
	}
	currencyFrom.innerHTML += options;
	currencyTo.innerHTML += options;
}
let ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
 	type: 'line',
	data: {
			labels: [],
			datasets: [{
				
					data: [],
				
			}]
	},
	options: {
		scales: {
				yAxes: [{
						ticks: {
								beginAtZero: true
						}
				}]
		}
	}
});;

function convert() {
	const currencyFrom = document.getElementById('currency1').value;
	const currencyTo = document.getElementById('currency2').value;
	const dateFrom = document.getElementById('datePicker1').value;
	const dateTo = document.getElementById('datePicker2').value;
	if(!currencyFrom || !currencyTo) return false;
	
	(async () => {
		const url = `https://api.exchangeratesapi.io/history?start_at=${dateFrom}&end_at=${dateTo}&symbols=${currencyTo}&base=${currencyFrom}`;
		const response = await fetch(url);
		const result = await response.json();
		// console.log(result);
		const sorted = Object.entries(result.rates).sort( ([key1, value1], [key2, value2]) => {
			const a2 = Date.parse(key1);
			const b2 = Date.parse(key2);
			return a2 - b2;
		});
		const rates = sorted.rates;
		/* const dates = Object.keys(result.rates);
		const values = Object.values(result.rates).map( values => values[`${currencyTo}`].toFixed(4)); */
		
		//.values and .keys methods return random arrays! =((
		let dates = [], values = [];
		for(let [date, value] of sorted) {
			dates.push(date);
			values.push(value[currencyTo]);
		}

		myChart.data.labels = dates;
		myChart.data.datasets[0].data = values;
		myChart.update();



	/* 	myChart = new Chart(ctx, {
			type: 'line',
			data: {
					// labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
					labels: dates,
					datasets: [{
							// label: '# of Votes',
							// data: [12, 19, 3, 5, 2, 3],
							data: values,
						  backgroundColor: [
									'rgba(255, 99, 132, 0.2)',
									'rgba(54, 162, 235, 0.2)',
									'rgba(255, 206, 86, 0.2)',
									'rgba(75, 192, 192, 0.2)',
									'rgba(153, 102, 255, 0.2)',
									'rgba(255, 159, 64, 0.2)'
							],
							borderColor: [
									'rgba(255, 99, 132, 1)',
									'rgba(54, 162, 235, 1)',
									'rgba(255, 206, 86, 1)',
									'rgba(75, 192, 192, 1)',
									'rgba(153, 102, 255, 1)',
									'rgba(255, 159, 64, 1)'
							], 
							// borderWidth: 1
					}]
			},
			options: {
					scales: {
							yAxes: [{
									ticks: {
											beginAtZero: true
									}
							}]
					},
					// responsive: true
					// maintainAspectRatio: false
			}
		}); */
		// const rate = result.rates[`${currencyTo}`].toFixed(4);
		// const scoreboard = document.getElementById('result');
		// scoreboard.innerHTML = `Current rate is ${rate}`;
	})();

}

