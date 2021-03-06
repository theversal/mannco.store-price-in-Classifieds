// ==UserScript==
// @name         mannco.store price in Classifieds
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  add price in popup menu
// @author       Versal
// @match      *://backpack.tf/classifieds*item=*
// @match      *://backpack.tf/stats*
// @match      *://backpack.tf/profiles/*
// @grant        GM.xmlHttpRequest
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

waitForKeyElements (
    ".popover-btns#popover-price-links",
    mypop
);

let mannco_data = {};
let price_boxes = $('div.price-boxes');

if(price_boxes.length > 0) addPriceBoxes();

async function addPriceBoxes() {
    let item_name = $('div.stats-header-title')[0].innerText;
    mannco_data[item_name] = await manncoRequest(item_name) || null;
    let manncoArray = !mannco_data[item_name] ? false : mannco_data[item_name];
    if(manncoArray) {
        price_boxes.append('<a class="price-box" href="https://mannco.store/item/' + manncoArray.id + '" data-tip="top" target="_blank" title="" data-original-title="Mannco.Store"> <img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4b/4b2b43c016a3fa7d915f99df1ef9436b7ad4a0ad_full.jpg"> <div class="text"> <div class="value">  $'+ Number(manncoArray.pp)/100 +' </div> <div class="subtitle"> '+ manncoArray.nbb+' available </div> </div> </a>')
    }
}

function mypop() {
    let buttons = $('.popover-btns#popover-price-links')
    let item_name = $('h3.popover-title')[0].innerText
    let mannco = async (item_name) => {
         if(!mannco_data[item_name]){
             mannco_data[item_name] = await manncoRequest(item_name) || null;
         }
        let manncoArray = !mannco_data[item_name] ? false : mannco_data[item_name];
        if(manncoArray) {
            buttons.append('<a class="btn btn-default btn-xs" href="https://mannco.store/item/' + manncoArray.id + '" target="_blank"><img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/38/38959a8bba1da1174f983c60e8d450b025209f43.jpg">  $'+ Number(manncoArray.pp)/100 +' <span class="text-muted"> x'+ manncoArray.nbb+'</span></a>')
        }
   }
    mannco(item_name)
};

function manncoRequest(name){
   let search_item_craftable = name.includes('Non-Craftable') ? 0 : 1;
   if(search_item_craftable == 0) name = name.replace('Non-Craftable ', '');
   return new Promise((resolve, reject) => {
    GM.xmlHttpRequest({
    method: "POST",
    headers: {
     "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    data: "a=&b=&c=&d=&e=" + name + "&f=DESC&g=&h=1&i=0&game=440&j=1",
    url: "https://mannco.store/requests/shop.php",
    onload: function(response) {
       resolve(JSON.parse(response.responseText).filter(el=> {
           let mannco_name = el.name;
           if(el.craftable != search_item_craftable){
               return false;
           }
           if(el.quality == 'Unusual') {
               mannco_name = el.effect.replace('★ ', '') + ' '+ mannco_name.replace('Unusual ', '')
               return mannco_name === name
           }
           return el.name === name
       })[0])
      }
   })
  })
}
