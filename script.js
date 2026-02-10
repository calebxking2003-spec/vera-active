
const rates = {
  CAD: 1,
  USD: 0.74,
  EUR: 0.68,
  GBP: 0.58
};
const basePrice = 149.99;
const baseOld = 219.99;

const currency = document.getElementById("currency");
const newPrice = document.getElementById("newPrice");
const oldPrice = document.getElementById("oldPrice");
const newPriceSticky = document.getElementById("priceNowSticky");
const oldPriceSticky = document.getElementById("priceWasSticky");


currency.addEventListener("change", () => {
  const c = currency.value;
  newPrice.textContent = (basePrice * rates[c]).toFixed(2) + " " + c;
  oldPrice.textContent = (baseOld * rates[c]).toFixed(2) + " " + c;
  if(newPriceSticky) newPriceSticky.textContent = (basePrice * rates[c]).toFixed(2) + " " + c;
  if(oldPriceSticky) oldPriceSticky.textContent = (baseOld * rates[c]).toFixed(2) + " " + c;
});
