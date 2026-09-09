export function debounce<A extends any[]>(fn: (...args: A) => void, delay: number = 200) {
  let timer: number;
  return function (this: any, ...args: A) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      Reflect.apply(fn, this, args);
    }, delay);
  };
}
