const pctChange = (array, period) => {
  return Array.from(array).slice(period ? period : 1).map((value, index) => {
    const prevIndex = index;
    const prevValue = array[index];
    const change = ((value - prevValue) / prevValue) * 100;
    return change;
  });
};

const diff = (array, period) => {
  return Array.from(array).slice(period ? period : 1).map((value, index) => {
    const prevIndex = index;
    const prevValue = array[index];
    const change = (value - prevValue);
    return change;
  });
};

const getLatest = (array) => { return Array.from(array).pop() }

