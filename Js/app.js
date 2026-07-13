(function(){
  "use strict";

  const LIMIT = 12000;
  const ids = ["hpp","hours","rate","turnover","commissionRate"];
  const el = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

  function num(input){
    const value = Number(String(input.value || "0").replace(",", "."));
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  function money(value){
    return Math.round(value).toLocaleString("cs-CZ") + " Kč";
  }

  function calculate(){
    const hpp = num(el.hpp);
    const hours = num(el.hours);
    const rate = num(el.rate);
    const turnover = num(el.turnover);
    const commissionRate = num(el.commissionRate);

    const dpp = hours * rate;
    const commission = turnover * commissionRate / 100;
    const dppTotal = dpp + commission;
    const total = hpp + dppTotal;
    const remaining = Math.max(0, LIMIT - dppTotal);
    const excess = Math.max(0, dppTotal - LIMIT);

    document.getElementById("dppPay").textContent = money(dpp);
    document.getElementById("hppOut").textContent = money(hpp);
    document.getElementById("dppOut").textContent = money(dpp);
    document.getElementById("commissionOut").textContent = money(commission);
    document.getElementById("totalOut").textContent = money(total);
    document.getElementById("remainingOut").textContent = money(remaining);
    document.getElementById("excessOut").textContent = money(excess);

    const status = document.getElementById("status");
    status.className = "status";

    if(dppTotal > LIMIT){
      status.classList.add("over");
      status.textContent = "Limit DPP překročen o " + money(excess);
    } else if(dppTotal >= LIMIT * 0.9){
      status.classList.add("near");
      status.textContent = "Blízko limitu – zbývá " + money(remaining);
    } else {
      status.classList.add("ok");
      status.textContent = "V limitu DPP – zbývá " + money(remaining);
    }

    try{
      localStorage.setItem("oftabal-mzdy-zdenka", JSON.stringify(
        Object.fromEntries(ids.map(id => [id, el[id].value]))
      ));
    }catch(e){}
  }

  function loadSaved(){
    try{
      const saved = JSON.parse(localStorage.getItem("oftabal-mzdy-zdenka") || "null");
      if(!saved) return;
      ids.forEach(id => {
        if(saved[id] !== undefined) el[id].value = saved[id];
      });
    }catch(e){}
  }

  function reset(){
    el.hpp.value = "27500";
    el.hours.value = "24";
    el.rate.value = "300";
    el.turnover.value = "0";
    el.commissionRate.value = "3";
    calculate();
  }

  ids.forEach(id => {
    el[id].addEventListener("input", calculate);
    el[id].addEventListener("change", calculate);
  });

  document.getElementById("resetBtn").addEventListener("click", reset);

  loadSaved();
  calculate();

  if("serviceWorker" in navigator){
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
