function convert() {
	let val1;
	let val2;
	const currencyFrom = document.getElementById('currency1').value; 
	const currencyTo = document.getElementById('currency2').value;
	// console.log(currencyFrom);
	// console.log(currencyTo);
	if(currencyFrom == 'RUB') val1 = 1;
	else val1 = fetchResult[currencyFrom].Value / fetchResult[currencyFrom].Nominal;
	
	if(currencyTo == 'RUB') val2 = 1;
	else val2 = fetchResult[currencyTo].Value / fetchResult[currencyTo].Nominal;
	
	const result = document.getElementById('result');
	result.innerHTML = `Current rate is ${val1 / val2}`;
}

// setTimeout(function() {alert(fetchResult)},1000);