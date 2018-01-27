let counter = 0;

const increment = () => {
  counter++;
  console.log('+ counter: '+ counter)
};

const zero = () => {
  counter=0;
  console.log('-- counter: ' +counter)
};

const returnCounter = () => {
  return(counter);
};

const worker = {
  increment,
  zero,
  counter,
};

module.exports = worker;
