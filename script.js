'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Victoria Munteanu',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2024-02-15T23:36:17.929Z',
    '2024-02-19T10:51:36.790Z',
   
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'John Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30, 5000, 900],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
    '2020-07-25T12:01:20.894Z',

  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions


const displayDate  = function(date, locale){

  const calcDaysPassed = (day1, day2) => Math.round(Math.abs(day2 - day1) / (1000 * 60 * 60 * 24));

  const date1 = new Date(); // Get the current date
  const date2 = date; // Get another date (you should replace this with the date you want to compare against)
  
  const daysPassed = calcDaysPassed(date1, date2); // Pass the dates to the function
  console.log(daysPassed);
  
  if(daysPassed === 0) return 'Today';
  if(daysPassed === 1) return 'Yesterday';
  if(daysPassed <= 7) return `${daysPassed} days ago`; 
  // else{
  //   const day = `${date.getDate()}`.padStart(2, 0);
  //   const month = `${date.getMonth() + 1}`.padStart(2, 0); 
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`; 
  // }
 return new Intl.DateTimeFormat(locale).format(date);

};

const formatCurrency = function(value, locale, currency){

  return new Intl.NumberFormat(locale, {
    style :'currency',
    currency: currency,
    
  }).format(value); 

}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
  
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]); 
    const displayDates = displayDate(date, acc.locale);
    const formattedMov = formatCurrency(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDates}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formattedMov = formatCurrency(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = formattedMov;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  const formattedMov = formatCurrency(incomes, acc.locale, acc.currency);
  labelSumIn.textContent = formattedMov; 

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(Math.abs(out), acc.locale, acc.currency);
  

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
    
  labelSumInterest.textContent = formatCurrency(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};


const startLogOutTimer = function(){ 
  const tick = function(){
    const min = String(Math.trunc(time/60)).padStart(2, 0); 
    const sec  = String(time% 60).padStart(2, 0); 
  
    //In each call back, print the remaining time 
    labelTimer.textContent = `${min}: ${sec}`; 
    
  
    //When 0 seconds, stop timer and log out user 
  
    if(time === 0){
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started"
      containerApp.style.opacity = 0;
    }
     //Decrease 
     time--; 

  };
  
  // Set time to 5 minutes
  let time = 120; 

  //Call the timer every second 
  tick();
  const timer= setInterval(tick, 1000); 
  return timer; 

};


///////////////////////////////////////


// Event handlers

let currentAccount; let timer; 

// Fake Always log in 

// currentAccount= account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100; 

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

 

  if (currentAccount?.pin === +(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;



  // Create date 
    const now =  new Date(); 
    const options = {
      hour :  'numeric',
      minute: 'numeric',
      day :'numeric',
      month:'numeric',
      year:'numeric'
    };
    
    // const locale = navigator.language;
    // console.log(locale);
    
    
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now); 

    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0); 
    // const year = now.getFullYear();
    // const hour= `${now.getHours()}`.padStart(2, 0);
    // const min=  `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year},${hour}:${min}`;


    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    if(timer) clearInterval(timer);
    timer = startLogOutTimer(); 

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    //Add transfer date 
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movements.push(new Date().toISOString()); 


    // Update UI
    updateUI(currentAccount);

    // Reset timer 
    clearInterval(timer); 
    timer = startLogOutTimer(); 

  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function(){// Add movement
    currentAccount.movements.push(amount);

    //Add loan  date 
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
},2500); 

  // Reset timer 
  clearInterval(timer); 
  timer = startLogOutTimer(); 

  }
  inputLoanAmount.value = '';
});




btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES


// console.log(23 === 23.0);
// // Base 10  from 0 to 9 
// // Binary 2 - 0 and 1  
// console.log(0.1 +  0.2);

// //Conversion
// console.log(+('23'));
// console.log(+'23');

// //Parsing 
// console.log(Number.parseInt('30px'));
// console.log(Number.parseInt('e23', 10));
// console.log(Number.parseFloat('2.5rem'));

// //Check if value is not a value 
// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20'));
// console.log(Number.isNaN(23/0));


// //Checking if a value is a number
// console.log(Number.isFinite('20'));

// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.0));



// console.log(Math.sqrt(25)); //square root
// console.log(8**(1/3)); //cubic root 
// console.log(Math.max(3, 56,'23', 7, 8, 90)); // does type conversion 
// console.log(Math.min(3, 56,'23', 7, 8, 90));
// console.log(Math.PI*Number.parseFloat('10px')**2); // area of a circle with 10px radius 
// console.log(Math.trunc(Math.random() * 10) + 1);  //remove the decimal wiht math.trunc 

// const randomInt = (min, max) => Math.floor(Math.random()*(max-min)+1); // 0..1 > 0 ...(max-)
// console.log(randomInt(10, 20));

// console.log(Math.trunc(23.4));
// console.log(Math.ceil(23.4)); //24
// console.log(Math.floor(23.4)); //23 
// console.log(Math.trunc(23.4));

// // Rounding decimals 

// console.log((2.7).toFixed(0)); // will always return a string 
// console.log((2.345).toFixed(2));


// //Remainder Operator  

// console.log(5 % 2); // 
// console.log(5/2); //5 = 2*2 +1 

// console.log(8 % 3);
// console.log(8 / 3); 

// const isEven = n => n % 2 === 0;
// console.log(isEven(8));
// console.log(isEven(23));
// console.log(isEven(524));


// labelBalance.addEventListener('click', function() {
//     [...document.querySelectorAll('.movements__row')].forEach(function (row, i){
//     if(i % 2 === 0) row.style.backgroundColor = "blue"
// });
// });


// //Numeric Separators 

// const number = 239_000_000_000; // underscore _ to separate 
// const PI = 3.14_15 

// // Working with BigInt 

// //34 bits  = numbers are represented 

// console.log(2** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(2343593454609450689758648364589433454565768n);
// console.log(BigInt(255435934546094506897586483));

// //Created date 

// const now = new Date(); 
// console.log(new Date(' December 24, 2015'));
// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(0));
// console.log(new Date(3*24 *60*60 *1000)); // convert days to miliseconds 

// //Working with dates 

// const future = new Date(2067, 10, 19, 25, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getHours())
// console.log(future.getMilliseconds());
// console.log(future.toISOString());


// console.log(Date.now());
// future.setFullYear(2048); 


//Operations 

// const future = new Date(2067, 10, 19, 25, 23); 
// console.log(Number(future));
// console.log(+future);


// const daysPast =  (day1, day2) => Math.abs(day2 - day1) / (1000 *60* 60 *24); 
// const day1 = daysPast(new Date(2067, 10, 19), new Date(2067, 11, 20));
// console.log(day1);



// // Internationalizing Numbers 

// const number = 2353464567864; 

// const options = {
//   style:'unit',  //unit, percent, currency 
//   unit:'mile-per-hour',
//   useGrouping: 'true',
// }; 

// console.log('US: ', new Intl.NumberFormat('en-US',options).format(number));
// console.log('Germany:    ', new Intl.NumberFormat('de-DE',options).format(number));
// console.log('Syria:    ', new Intl.NumberFormat('ar-SY',options).format(number));
// console.log(navigator.language, new Intl.NumberFormat(navigator.language,options).format(number));




//Timers 

// setTimeout((ing1, ing2) => console.log(`Here is the pizza ${ing1} and ${ing2} 🍕`), 
// 3000, 'olives', 'spinatch'); // the code execution does not stop here 


// setInterval(function(){
// const now = new Date();
// let hours = now.getHours();
// let minutes  = now.getMinutes();
// let seconds = now.getSeconds(); 
// console.log(`${hours}: ${minutes}: ${seconds}`);
// }, 1000);