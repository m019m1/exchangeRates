let fetchResult;
(async () => {
	const url = "https://www.cbr-xml-daily.ru/daily_json.js";
	const response = await fetch(url);
	const result = await response.json();
	fetchResult = result.Valute;
	const currencies = Object.values(fetchResult);
	console.log(currencies);
	console.log(fetchResult);
	const currencyFrom = document.getElementById('currencyFrom'); 
	const currencyTo = document.getElementById('currencyTo');
	let html = '';
	for(let {CharCode, Name} of currencies) {
		// console.log(currencies[val].CharCode);
		// console.log(CharCode);
		html += `<option value=${CharCode}>${Name}</option>`;
	}
	currencyFrom.innerHTML += html;
	currencyTo.innerHTML += html;
	// const rate = convert('AMD', 'RUB', currencies);
	// console.log(rate);
})();