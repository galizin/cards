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

//var num = 0x1f0a0;
var shft = 25;
var hDim = 62;
var vDim = 73;
var vGap = 8
var hGap = 2;

spanIdx(idx,level) {
  return("span.outerspan[currLane='" + idx + "'][currLevel = '" + level + "']");
}

spanUp(idx) {
  return spanIdx(idx, "true");
}

spanDn(idx) {
  return spanIdx(idx, "false");
}

elMove(el) {
  $(el).attr("ontouchstart", "dragstart_handler(event)").attr("ontouchend", "drop_handler(event)")
    .attr("ontouchmove","dragover_handler(event)");
}

elFix(el) {
  $(el).attr("ontouchstart", "").attr("ontouchend", "").attr("ontouchmove","");
}

function alignOpenStock() {
    stockOpen = $("#main").find(spanUp(5));
    for (let i = 0; i < stockOpen.length; i++) {
        let idx = stockOpen.length - 1 - i;
        $(stockOpen[idx]).css("left", laneToLeft(5) + ([0, 1].includes(i) ? -1 * i * vGap * 4 : -2 * vGap * 4) + 'px');
        if(!i) {
          elMove(stockOpen[idx]);
        } else {
          elFix(stockOpen[idx]);
        }
    }
}

function cycleStock() {
    let stock = $("#main").find(spanUp(6));
    if (!stock.length) {
        $("#main").find(spanUp(5)).toArray().map(m => $(m).attr("currLane", 6).css("left", laneToLeft(6)));
        stock = $("#main").find(spanUp(6));
    }
    let repeat = 0;
    while (stock.length > 0) {
        if (repeat > 2) {
            break;
        }
        repeat++;
        let stockOpen = $("#main").find(spanUp(6));
        $(stock[0]).attr("currLane", 5).css("left", laneToLeft(5) + 'px').css("top", vGap + 'px');
        if (stockOpen.length) {
            stockOpen[stockOpen.length - 1].append(stock[0]);
        } else {
            $("#main")[0].append(stock[0]);
        }
        if (stock[1]) {
            $("#main")[0].append(stock[1]);
        }
        stock = $("#main").find(spanUp(6));
    }
    alignOpenStock();
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

function laneToLeft(laneNo) {
    return (hGap + (hDim + hGap) * laneNo);
}

function prpgStack(el) {
    let sh = 0;
    const laneNo = $(el).attr("currLane");
    const level = $(el).attr("currLevel");
    const top = parseInt(el.style.top);
    const left = parseInt(el.style.left);
    for (let child of $(el).find('.outerspan')) {
        if (($(el).attr("retLevel") === 'false') || (level === 'false')) {
            sh += shft;
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
    const viewportOffset = el.getBoundingClientRect();
    let calcLeft = leftToLane(parseInt(el.style.left));
    calcLeft = (topToLevel(parseInt(el.style.top)) && (calcLeft == 4)) ? 5 : calcLeft;
    $(el).attr("touchstartoffset", (-viewportOffset.top + touches[0].pageY) + ',' + (-viewportOffset.left + touches[0].pageX))
        .attr("retLane", calcLeft).attr("retLevel", topToLevel(parseInt(el.style.top)));
    $(el).appendTo("#main").attr("currLane", "-1");
    prpgStack(el);
}

function dragover_handler(ev) {
    ev.preventDefault();
    const touches = ev.changedTouches;
    let el = ev.target.closest(".outerspan");
    if (el) {
        if (!((["6"].includes($(el).attr("retLane"))) && ($(el).attr("retLevel") === "true"))) {
            let offs = $(el).attr("touchstartoffset");
            el.style.top = (touches[0].pageY - Number(offs.split(',')[0])) + 'px';
            el.style.left = (touches[0].pageX - Number(offs.split(',')[1])) + 'px';
            prpgStack(el);
        }
    }
}

function drop_handler(ev) {
    ev.preventDefault();
    const touches = ev.changedTouches;
    let el = ev.target.closest(".outerspan");
    if (el) {
        let laneNo = leftToLane(parseInt(el.style.left));
        let level = topToLevel(parseInt(el.style.top));
        let stackOnLane = $("#main").find("span[currLane=" + laneNo + "][currLevel=" + level + "].outerspan");

        if ((level === true) && ([6].includes(laneNo)) && ([6].includes(parseInt($(el).attr("retLane"))))) {
            let stock = $("#main").find(".outerspan[currLane = '" + laneNo + "'][currLevel = 'true']");
            $(el).attr("currLane", laneNo).css("left", laneToLeft(laneNo) + 'px');
            if (stock.length) {
                stock[stock.length - 1].append(el);
            } else {
                $("#main")[0].append(el);
            }
            cycleStock();
        } else {

            if ((
                    (level === true) && ([0, 1, 2, 3].includes(laneNo)) && ($(el).find(".outerspan").length === 0)
                    && (elToSuit(el) === laneNo)
                    && ((stackOnLane.length === 0) && (elToCard(el) === 0) ||
                        ((stackOnLane.length !== 0) && (elToCard(el) - 1 === elToCard(stackOnLane[stackOnLane.length - 1]))))
                ) || (
                    (level === false)
                    && (((stackOnLane.length === 0) && (elToCard(el) === 12)) ||
                        ((stackOnLane.length !== 0) && (elToCard(el) + 1 === elToCard(stackOnLane[stackOnLane.length - 1]))
                        &&  (suitTest(elToSuit(el), elToSuit(stackOnLane[stackOnLane.length - 1]))))
                    )
                )) {

            } else {
                laneNo = parseInt($(el).attr("retLane"));
                level = ($(el).attr("retLevel") === "true");
            }

            $(el).attr("retLevel", "").attr("retLane", "").attr("currLevel", level);
            stackOnLane = $("#main").find("span[currLane=" + laneNo + "][currLevel=" + level + "].outerspan");
            if (stackOnLane.length == 0) {
                if (level) {
                    $(el).appendTo("#main").css("top", vGap + "px");
                } else {
                    $(el).appendTo("#main").css("top", vDim + vGap * 2 + "px");
                }
                $(el).attr("currLane", laneNo).css("left", laneToLeft(laneNo) + 'px');
                prpgStack(el);
            } else {
                let isOnStack = false;
                for (child of stackOnLane) {
                    if ($(el).attr("id") == $(child).attr("id")) {
                        isOnStack = true;
                        break;
                    }
                }
                if (!isOnStack) {
                    let newParent = stackOnLane[stackOnLane.length - 1];
                    $(el).appendTo(newParent);
                    prpgStack(newParent);
                }
            }
        }
        alignOpenStock();
    }
}

cardString = function(cardNum, suit, top, left) {
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
        .attr("style", "top:" + top + "px; left:" + left + "px")
        .attr("ontouchstart", "dragstart_handler(event)").attr("ontouchend", "drop_handler(event)")
        .attr("ontouchmove","dragover_handler(event)")
        .attr("currLane", leftToLane(left)).attr("currLevel", topToLevel(top));
    $(el).html(((red) ? '<mark class="red">' : '') + '<span class="innerspan">' + cardname + suitname + '</span>' + ((red) ? '</mark>' : ''));
    return el;
};

nonCardString = function(suit, top, left) {
    let red = suit == "hearts" || suit == "diams" ? 1 : 0;
    let el = document.createElement("span");
    $(el).attr("class", "outerspan").attr("style", "top:" + top + "px; left:" + left + "px");
    if (suit === "") {
        $(el).attr("ontouchstart", "dragstart_handler(event)").attr("ontouchend", "drop_handler(event)").attr("id", "stackoverturn");
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
        for (let level = 0; level < 7; level++) {
            if (lane >= level) {
                const card = deckCopy.pop();
                el = $("#" + card.suit.toString(16) + card.no.toString(16))[0];
                const top = vGap * 2 + vDim + shft * level;
                const left = hGap + (hGap + hDim) * lane;
                $(el).css("top", top + "px").css("left", left + "px")
                    .attr("currLane", leftToLane(left)).attr("currLevel", topToLevel(top));
                $("#main").append(el);
                if (parentEl) {
                    parentEl.append(el);
                } else {
                    $("#main")[0].append(el);
                }
                parentEl = el;
            }
        }
    }
    let parentEl = null;
    while (deckCopy.length > 0) {
        const card = deckCopy.pop();
        el = $("#" + card.suit.toString(16) + card.no.toString(16))[0];
        const top = vGap;
        const left = hGap + (hGap + hDim) * 6;
        $(el).css("top", top + "px").css("left", left + "px")
            .attr("currLane", leftToLane(left)).attr("currLevel", topToLevel(top));
        $("#main").append(el);
        if (parentEl) {
            parentEl.append(el);
        } else {
            $("#main")[0].append(el);
        }
        parentEl = el;
    }
    $("#main")[0].append($("#stackoverturn")[0]);
}

window.addEventListener('load', function() {
    $("#main")[0].append(nonCardString("spades", vGap, hGap + (hGap + hDim) * 0));
    $("#main")[0].append(nonCardString("hearts", vGap, hGap + (hGap + hDim) * 1));
    $("#main")[0].append(nonCardString("diams", vGap, hGap + (hGap + hDim) * 2));
    $("#main")[0].append(nonCardString("clubs", vGap, hGap + (hGap + hDim) * 3));
    const deckCopy = [...deck];
    for (let lane = 0; lane < 7; lane++) {
        let parentEl = null;
        for (let level = 0; level < 7; level++) {
            if (lane >= level) {
                const card = deckCopy.pop();
                el = cardString(card.no, card.suit, vGap * 2 + vDim + shft * level, hGap + (hGap + hDim) * lane);
                if (parentEl) {
                    parentEl.append(el);
                } else {
                    $("#main")[0].append(el);
                }
                parentEl = el;
            }
        }
    }
    let parentEl = null;
    while (deckCopy.length > 0) {
        const card = deckCopy.pop();
        el = cardString(card.no, card.suit, vGap, hGap + (hGap + hDim) * 6);
        if (parentEl) {
            parentEl.append(el);
        } else {
            $("#main")[0].append(el);
        }
        parentEl = el;
    }

    let btn = document.createElement("button");
    $(btn).css("top", "450px").html("reload").attr("onclick", "placeCards();");
    $("#main")[0].append(btn);
    $("#main")[0].append(nonCardString("", vGap, hGap + (hGap + hDim) * 6));
});
