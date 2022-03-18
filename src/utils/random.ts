const random = {
  choose<T>(items: Array<T>) {
    const index = Math.floor((Math.random() * items.length));
    return items[index];
  },
  shuffle<T>(arr: T[]) {
    let i = arr.length;
    while (i) {
      const j = Math.floor(Math.random() * i--);
      [arr[j], arr[i]] = [arr[i], arr[j]];
    }
    return arr;
  },
};

export default random;
