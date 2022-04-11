const icons = {

}

export default Object.fromEntries(Object.entries(icons).map(([k, v]) => [k, {
  body: v,
  width: 48,
  height: 48,
}]));
