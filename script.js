class Card {
    constructor(suit, no) {
        this.suit = suit;
        this.no = no;
    }
}

const initDeck = function(deck) {
    for (let suits = 0; suits < 4; suits++) {
        for (let nos = 0; nos < 13; nos++) {
            deck.push(new Card(suits, nos));
        }
    }
}

const shuffleDeck = function(deck) {
    const deck2 = [];
    while (deck.length > 0) {
        let idx = Math.floor(Math.random() * deck.length);
        deck2.push(deck[idx]);
        deck.splice(idx, 1);
    }
    return deck2;
}

const emptyDeck = [];

initDeck(emptyDeck);

const deck = shuffleDeck(emptyDeck);

let deckBkp = [];

var shft = 25;
var hDim = 62;
var vDim = 73;
var vGap = 8
var hGap = 2;

function spanIdx(idx,level) {
  return("span.outerspan[currLane='" + idx + "'][currLevel = '" + level + "']");
}

function spanUp(idx) {
  return spanIdx(idx, "true");
}

function spanDn(idx) {
  return spanIdx(idx, "false");
}

function stockIdx(idx, level) {
  return $("#main").find(spanIdx(idx,level));
}

function stockUp(idx) {
  return $("#main").find(spanUp(idx));
}

function stockDn(idx) {
  return $("#main").find(spanDn(idx));
}

function elMove(el) {
  $(el).attr("ontouchstart", "dragstart_handler(event)").attr("ontouchend", "drop_handler(event)")
    .attr("ontouchmove","dragover_handler(event)");
}

function elFix(el) {
  $(el).attr("ontouchstart", "").attr("ontouchend", "").attr("ontouchmove","");
}

function laneToLeft(laneNo) {
    return (hGap + (hDim + hGap) * laneNo);
}

function posToLn(el, ln) {
    return $(el).attr("currLane", ln).css("left", laneToLeft(ln) + 'px');
}

function alignOpenStock() {
    const stockOpen = stockUp(5);
    let count = 0;
    while (count < stockOpen.length) {
      let m = stockOpen[count];
      elFix(m);
      switch (count) {
        case stockOpen.length - 2:
          $(m).css("left", laneToLeft(5) -1*vGap*4 + 'px');
          //$(m).css("transform", `translateX(${vGap*4}px)`);
          break;
        case stockOpen.length - 1:
          $(m).css("left", laneToLeft(5) + 'px');
          //$(m).css("transform", `translateX(${vGap*4}px)`);
          //$(m).css("left", laneToLeft(5) + 'px');
          //$(m).css("transform", `translateX(}px)`);
          elMove(m);
          break;
        default:
          $(m).css("left", laneToLeft(5) -2*vGap*4 + 'px');
          break;
      }
      count++;
    }
}

function cycleStock() {
    let stock = stockUp(6);
    if (!stock.length) {
        let stockOpen = stockUp(5);

        while (stockOpen.length) {
          let m = $(stockOpen).last()[0];
          posToLn(m, 6);
          elFix(m);
          if (stock.length) {
             $(stock).last()[0].append(m);
          } else {
              $("#main")[0].append(m);
          }
          stock = stockUp(6);
          stockOpen = stockUp(5);
        }
    } else {
    let repeat = 0;
    while (stock.length > 0) {
        if (repeat > 2) {
            break;
        }
        repeat++;
        let stockOpen = stockUp(5);
        if (stockOpen.length) {
            $(stockOpen).last()[0].append($(stock).last()[0]);
        } else {
            $("#main")[0].append($(stock).last()[0]);
        }
        stockOpen = stockUp(5);
        posToLn($(stock).last()[0], 5).css("left", laneToLeft(5) -2*vGap * 4 + "px").css("top", vGap + 'px');
        stock = stockUp(6);
    }
    alignOpenStock();
    }
    $("#main")[0].append($("#stackoverturn")[0]);
}

function elToCard(el) {
    return parseInt($(el).attr("id").substring(1, 2), 16);
}

function elToSuit(el) {
    return parseInt($(el).attr("id").substring(0, 1), 16);
}

function suitColor(suit) {
    return [1, 2].includes(suit) ? "red" : "black";
}

function suitTest(suit1, suit2) {
    return suitColor(suit1) !== suitColor(suit2);
}

function leftToLane(left) {
    let laneNo = -1;
    for (let i = 0; i < 7; i++) {
        if ((left > hGap - hDim / 2 + (hGap + hDim) * i) && (left < (hGap + hDim / 2 + (hGap + hDim) * i))) {
            laneNo = i;
            break;
        }
    }
    return laneNo;
}

function topToLevel(top) {
    return top + vDim / 2 < (vGap * 1.5 + vDim);
}

function prpgStack(el) {
    let sh = 0;
    const laneNo = $(el).attr("currLane");
    const level = $(el).attr("currLevel");
    const move = $(el).hasClass("move");
    let top = 0;
    let left = 0;
    if(move) {
      top = parseInt(el.style.top);
      left = parseInt(el.style.left);
    } else {
      top = vGap + (level === 'false' ? (vGap + vDim) : 0); //parseInt(el.style.top);
      left = laneToLeft(laneNo); //parseInt(el.style.left);
      el.style.top = top + sh + 'px';
      el.style.left = left + 'px';
    }
    for (let child of $(el).find('.outerspan')) {
        if (/*($(el).attr("retLevel") === 'false') ||*/ (level === 'false')) {
            sh += shft;
        }
        if(move) {
          $(child).addClass("move");
        } else {
          $(child).removeClass("move");
        }
        child.style.top = top + sh + 'px';
        child.style.left = left + 'px';
        if (laneNo) {
            $(child).attr("currLane", laneNo);
            $(child).attr("currLevel", level);
        }
    }
}

function dragstart_handler(ev) {
    ev.preventDefault();
    const touches = ev.changedTouches;
    const el = ev.target.closest(".outerspan");
    if(el) {
      const viewportOffset = el.getBoundingClientRect();
      if($(el).attr("currLane") !== "-1") {
        $(el).attr("retLane", $(el).attr("currLane"));
      }
      $(el).attr("touchstartoffset", (-viewportOffset.top + touches[0].pageY) + ',' + (-viewportOffset.left + touches[0].pageX))
        .attr("retLevel", $(el).attr("currLevel")).appendTo("#main").attr("currLane", "-1").addClass("move");
      $(el).removeClass("grey");
      prpgStack(el);
      alignOpenStock();
    }
}

function dragover_handler(ev) {
    ev.preventDefault();
    const touches = ev.changedTouches;
    let el = ev.target.closest(".outerspan");
    if (el && $(el).hasClass("move")) {
            let offs = $(el).attr("touchstartoffset");
            el.style.top = (touches[0].pageY - Number(offs.split(',')[0])) + 'px';
            el.style.left = (touches[0].pageX - Number(offs.split(',')[1])) + 'px';
            prpgStack(el);
    }
}

function drop_handler(ev) {
    ev.preventDefault();
    const touches = ev.changedTouches;
    let el = ev.target.closest(".outerspan");
    if (el) {
        const fromLaneNo = leftToLane(parseInt(el.style.left));
        const fromLevel = topToLevel(parseInt(el.style.top));
        const retLane = parseInt($(el).attr("retLane"));
        const retLevel = $(el).attr("retLevel") === "true";
        let laneNo = fromLaneNo;
        let level = fromLevel;
            let stackOnLane = stockIdx(laneNo, level);
            let stackEmpty = stackOnLane.length === 0;
            const onlyEl = $(el).find(".outerspan").length === 0;
            const elSuit = elToSuit(el);
            const elCard = elToCard(el);
            const lastCardSuit = stackEmpty ? null : elToSuit($(stackOnLane).last());
            const lastCardCard = stackEmpty ? null : elToCard($(stackOnLane).last());

            if ((
                    (level === true) && [0, 1, 2, 3].includes(laneNo) && onlyEl && (elSuit === laneNo)
                    && (stackEmpty && (elCard === 0) || ((!stackEmpty) && (elCard - 1 === lastCardCard)))
                ) || (
                    (level === false) && ((stackEmpty && (elCard === 12)) ||
                    ((!stackEmpty) && (elCard + 1 === lastCardCard) && suitTest(elSuit, lastCardSuit)))
                )) {
            } else {
                laneNo = retLane;
                level = retLevel;
                stackOnLane = stockIdx(laneNo, level);
                stackEmpty = stackOnLane.length === 0;
            }

            $(el).attr("retLevel", "").attr("retLane", "").attr("currLevel", level).attr("currLane", laneNo);
            if (!stackEmpty) {
                let isOnStack = false;
                for (child of stackOnLane) {
                    if ($(el).attr("id") == $(child).attr("id")) {
                        isOnStack = true;
                        break;
                    }
                }
                if (!isOnStack) {
                    $(el).appendTo($(stackOnLane).last()[0]);
                }
            }
            stackOnLane = stockIdx(laneNo, level);
            prpgStack(stackOnLane[0]);
        $(el).removeClass("move");
            prpgStack(stackOnLane[0]);
        alignOpenStock();
    }
}

cardString = function(cardNum, suit, fixed) {
    let red = suit == 1 || suit == 2 ? 1 : 0;
    let suitname = "";
    switch (suit) {
        case 0:
            suitname = "&spades;";
            break;
        case 1:
            suitname = "&hearts;";
            break;
        case 2:
            suitname = "&diams;";
            break;
        case 3:
            suitname = "&clubs;";
            break;
    }
    let cardname = "";
    switch (cardNum) {
        case 0:
            cardname = "A";
            break;
        case 12:
            cardname = "K";
            break;
        case 11:
            cardname = "Q";
            break;
        case 10:
            cardname = "J";
            break;
        default:
            cardname = cardNum + 1 + "";
            break;
    }
    let el = document.createElement("span");
    $(el).attr("class", "outerspan").attr("id", suit.toString(16) + cardNum.toString(16))
    elMove(el);
    if(fixed) {
      elFix(el);
    }
    $(el).html(((red) ? '<mark class="red">' : '') + '<span class="innerspan">' + cardname + suitname + '</span>' + ((red) ? '</mark>' : ''));
    return el;
};

nonCardString = function(suit, top, left) {
    let red = suit == "hearts" || suit == "diams" ? 1 : 0;
    let el = document.createElement("span");
    $(el).attr("class", "outerspan").attr("style", "top:" + top + "px; left:" + left + "px");
    if (suit === "") {
        $(el).attr("onclick", "cycleStock()").attr("id", "stackoverturn");
        $(el).html('<span class="innerspan" />');
    } else {
        $(el).html('<span class="innerspan place ' + ((red) ? 'red' : '') + '">&' + suit + ';</span>');
    }
    return el;
};

function placeCards() {
    const deckCopy = [...deck];
    for (let lane = 0; lane < 7; lane++) {
        let parentEl = null;
        //let topEl = null;
        for (let level = 0; level < 7; level++) {
            if (lane >= level) {
                const card = deckCopy.pop();
                el = $("#" + card.suit.toString(16) + card.no.toString(16))[0];
                $(el).attr("currLane", lane).attr("currLevel", 'false');
                //$("#main").append(el);
                if (parentEl) {
                    parentEl.append(el);
                } else {
                    $("#main")[0].append(el);
                    //topEl = el;
                }
                parentEl = el;
            }
        }
        //prpgStack(topEl);
    }
    let parentEl = null;
    let topEl = null;
    while (deckCopy.length > 0) {
        const card = deckCopy.pop();
        el = $("#" + card.suit.toString(16) + card.no.toString(16))[0];
        $(el).attr("currLane", 6).attr("currLevel", 'true');
        //$("#main").append(el);
        if (parentEl) {
            parentEl.append(el);
        } else {
            $("#main")[0].append(el);
            topEl = el;
        }
        parentEl = el;
    }
    prpgStack(topEl);
    for (let lane = 0; lane < 7; lane++) {
      prpgStack(stockDn(lane)[0]);
    }
    $("#main")[0].append($("#stackoverturn")[0]);
}

window.addEventListener('load', function() {
    $("#main")[0].append(nonCardString("spades", vGap, hGap + (hGap + hDim) * 0));
    $("#main")[0].append(nonCardString("hearts", vGap, hGap + (hGap + hDim) * 1));
    $("#main")[0].append(nonCardString("diams", vGap, hGap + (hGap + hDim) * 2));
    $("#main")[0].append(nonCardString("clubs", vGap, hGap + (hGap + hDim) * 3));
    $("#main")[0].append(nonCardString("", vGap, hGap + (hGap + hDim) * 6));
    const deckCopy = [...deck];
    while (deckCopy.length > 0) {
        const card = deckCopy.pop();
        el = cardString(card.no, card.suit, false); //vGap, hGap + (hGap + hDim) * 6);
            $("#main")[0].append(el);
    }
    placeCards();
    let btn = document.createElement("button");
    $(btn).css("top", "450px").html("start over").attr("onclick", "placeCards();");
    $("#main")[0].append(btn);
});
