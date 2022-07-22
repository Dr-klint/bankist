'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-07-18T17:01:17.194Z',
    '2022-07-20T23:36:17.929Z',
    '2022-07-22T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2022-07-10T16:43:26.374Z',
    '2022-07-20T18:49:59.371Z',
    '2022-07-22T12:01:20.894Z',
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
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // else {
  //   const day = `${date.getDate()}`.padStart(2, 0);
  //   const month = `${date.getMonth() + 1}`.padStart(2, 0);
  //   const year = date.getFullYear();

  //   return `${day}/${month}/${year}`;
  // }
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
       <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
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

const startLogOutTimer = function () {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //in each call, print the remaining time to the ui
    labelTimer.textContent = `${min}:${sec}`;

    //when timer hits 0, logout user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    //Decrease time by 1s
    time--;
  };
  //set time to 5 min
  let time = 300;

  //call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// ////FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    ////////////////////////////////////////////
    ////INTERNATIONALIZING DATES
    /////////CREATE DATE AND TIME
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //long , short , narrow
      year: 'numeric', //2-digit
      // weekday: 'long',
    };
    // const locale = navigator.language;
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const now = new Date();
    // const date = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${date}/${month}/${year}, ${hour}:${min}`;
    /// date/ month / year

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
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

    ///Add transfer dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      ///Add loan dates
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset Timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
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
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
console.log(23 === 23.0);
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

///CONVERTING STRINGS TO NUMBERS
console.log(Number('23'));
console.log(+'23');

///PARSING : First digit must be a number, the second parameter passed in should be a number representing the base form
///PARSE-INT
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e30', 10));

///PARSE-FLOAT : It can read off the decimal number
console.log(Number.parseFloat('  3.5px  ', 10));
console.log(Number.parseFloat('e30', 10));
console.log(parseFloat(' 2.5rem '));

/////isNaN :  to detect which is NaN, returns a boolean
console.log(Number.isNaN(23));
console.log(Number.isNaN('23'));
console.log(Number.isNaN('help'));
console.log(Number.isNaN(+'23X'));
console.log(Number.isNaN('e30'));
console.log(Number.isNaN(23 / 0));

//////isFinite : to detect which is a number, returns a boolean
console.log(Number.isFinite(23));
console.log(Number.isFinite('23'));
console.log(Number.isFinite(+'23X'));
console.log(Number.isFinite(23 / 0));

//////isInteger : to detect which is a number, returns a boolean
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger('23'));
console.log(Number.isInteger(+'23X'));
console.log(Number.isInteger(23 / 0));

////////////////////////////////////////
///////MATH AND ROUDNING

////SQUARE ROOT
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

////MAX
console.log(Math.max(2, 5, 12, 5, 44, 8));
console.log(Math.max(...account2.movements));
console.log(Math.max(2, 5, 12, 5, '44', 8)); //type coercion
console.log(Math.max(2, 5, 12, 5, '44px', 8)); //parson

////MIN
console.log(Math.min(2, 5, 12, 5, 44, 8));
console.log(Math.min('2', 5, 12, 5, '44', 8)); //type coercion
console.log(Math.min(2, 5, 12, 5, '44px', 8)); //parson

///RADIUS OF A CICRLE
console.log(Math.PI * Number.parseFloat('10px') ** 2);

/////RANDOM NUMBERS
console.log(Math.trunc(Math.random() * 6 + 1));
const randomInt = (min, max) => Math.round(Math.random() * (max - min)) + min;
console.log(randomInt(2, 4));

/////ROUNDING INTEGERS: they work with type coercion
///MATH TRUNC : Removes decimal points
console.log(Math.trunc(23.4));
console.log(Math.trunc(-23.4));

///MATH ROUND : rounds to the nearest whole number
console.log(Math.round(23.9));
console.log(Math.round(23.4));

///MATH CEIL : rounds up
console.log(Math.ceil(23.9));
console.log(Math.ceil(23.4));

///MATH FLOOR : rounds down
console.log(Math.floor(23.9));
console.log(Math.floor(23.4));
console.log(Math.floor(-23.4));

/////ROUNDING DECIMALS
////toFixed = it gives the number of decimal points specified in the parameter and returns it as a string
console.log((23.7).toFixed(0));
console.log((23.7).toFixed(2));
console.log(+(23.7567).toFixed(3));


///////////////////////////////////////
///////THE REMAINDER OPERATOR
console.log(5 % 2);
console.log(5 / 2); //5 = 2 * 2 + 1

console.log(8 % 3);
console.log(8 / 3); //8 = 3 * 2 + 2

console.log(8 % 2);
console.log(8 / 2);

console.log(7 % 3);
console.log(7 / 3);

const isEven = n => n % 2 === 0;
console.log(isEven(7));
console.log(isEven(6));
console.log(isEven(384));

///PRACTICAL EXAMPLE : using remainder every nth time
labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
    ///////0,2,4,6
    i % 2 === 0
      ? (row.style.backgroundColor = 'orange')
      : console.log(`not divisible`);

    ///////0,3,6
    i % 3 === 0
      ? (row.style.backgroundColor = 'blue')
      : console.log(`not divisible`);
  });
});

////////////////////////////////////////////////
/////////WORKING WITH BIG INT: big integer
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER); //biggest number js can safety integrate
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);
console.log(2 ** 53 + 6);
console.log(2 ** 53 + 13);

console.log(98496854943498918495020905n);
console.log(BigInt(6763889));

///Operations
console.log(10000n + 10000n);
console.log(398348729032023n * 283929n);
// console.log(Math.sqrt(16n)); //math operator doesnt work

const huge = 837393208033n;
const num = 389;
console.log(huge * BigInt(num)); ///cant use big int with regular number

////COMPARISON
console.log(20n > 15);
console.log(20n === 20); //returns a false becauses === doesnt do type coercion
console.log(typeof 20n);
console.log(20n == 20);
console.log(huge + ' is really big');

//////DIVISION
// console.log(12n / 3); ///cant use big int with regular number
console.log(11n / 3n); ///clears out decimal numbers
console.log(12n / 3n);

///////////////////////////////////////////////
///////// CREATING DATES AND TIME
const now = new Date();
console.log(now);
console.log(new Date('Wed Jul 20 2022 14:07:53'));
console.log(new Date('December 24, 2015'));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 14, 54, 38)); //MONTH in javascript is zero base

console.log(new Date(2031, 10, 31)); //Js will auto correct to the correct date

console.log(new Date(0)); //DAY 1
console.log(new Date(3 * 24 * 60 * 60 * 1000)); //3 DAYS AFTER

/// TIME STAMP = 24 * 60 * 60 * 1000

///WORKING WITH DATES
const future = new Date(2037, 10, 19, 14, 54, 38); //year , month, day ,hour , minute, second , milisecond
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate()); //day in the month
console.log(future.getDay()); //day of the week : zero base too
console.log(future.getTime()); //produces the time stamp
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.getMilliseconds());
console.log(future.toISOString());

///USING THE TIME STAMP TO GET A NEW DATE
console.log(new Date(2142251678000));
console.log(Date.now()); //produces time stamp
console.log(new Date(1658326403149));

/////SETTING DATES
future.setFullYear(2040); //it mutates it
console.log(future);

////////////////////////////////////////////
////OPERATION WITH DATES

const future = new Date(2037, 10, 19, 14, 54, 38);
console.log(future);
console.log(+future);

///difference between dates gives a time stamp in millisecond
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
console.log(
  calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14, 10, 38))
);

////////////////////////////////////////////
////INTERNATIONALIZING NUMBERS
const num = 37492843.34;
const options = {
  style: 'currency', //percent, currency ,unit
  unit: 'mile-per-hour', //celsuis
  currency: 'EUR',
  // useGrouping: false,
};
console.log('US:    ', new Intl.NumberFormat('en-US', options).format(num));
console.log(
  'Germany:     ',
  new Intl.NumberFormat('de-DE', options).format(num)
);
console.log('Syria:     ', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
);


////////////////////////////////////////////
////TIMERS SET-TIME OUT AND SET-TIME INTERVAL
setTimeout(
  (ing1, ing2) => console.log(`order a pizza with ${ing1} and ${ing2}`),
  3000,
  'olive',
  'spinach'
); //set time out takes a function as it's first parameter then millisecond as interval for second parameter, the rest parameter is what will be called in  the function argument parameter
console.log(`waiting...`);

////CANCELING A TIMER
const ingredients = ['olive', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`order a pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

////SET-TIME INTERVAL : repeating a loop
setInterval(() => {
  const now = new Date();
  // console.log(now);
}, 1000);

*/
